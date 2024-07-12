import React, { useEffect, useState } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Text } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import axios from "axios";
import { baseAPI } from '../services/types';
import { Avatar } from 'react-native-paper';

const ChatComponent: React.FC<{
  user: "customer" | "driver";
  accessToken: string;
  orderId: number;
  userData: any;
}> = ({ user, accessToken, orderId, userData }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Fetch chat messages from Django backend
    axios
      .get(`${baseAPI}/info/get_order_chat/${orderId}/`)
      .then((response) => {
        const chatMessages = response.data;
        console.log("received message", chatMessages);
        const formattedMessages = chatMessages.map((chatMessage: any) => ({
          _id: chatMessage.id,
          text: chatMessage.message,
          createdAt: new Date(chatMessage.timestamp),
          user: {
            _id: chatMessage.sender,
            name: chatMessage.sender_username,
            avatar: `${baseAPI}${chatMessage.sender.avatar || ''}`,
          },
        }));
        setMessages(formattedMessages.reverse());
      })
      .catch((error) => console.error("Error fetching chat messages:", error));
  }, [accessToken, orderId]);

  const onSend = (newMessages: IMessage[]) => {
    // Send new message to Django backend
    axios
      .post(`${baseAPI}/info/send_chat_message/`, {
        user_id: userData?.user_id,
        order_id: orderId,
        message: newMessages[0].text,
      })
      .then((response) => {
        // Update local messages state
        setMessages((prevMessages) =>
          GiftedChat.append(prevMessages, newMessages),
        );
      })
      .catch((error) => console.error("Error sending message:", error));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.openButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.openButtonText}>Open Chat</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Chat</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>
            <GiftedChat
              messages={messages}
              onSend={(newMessages) => onSend(newMessages)}
              user={{
                _id: userData?.user_id,
                name: userData?.username,
                avatar: `${baseAPI}${userData?.avatar || ''}`,
              }}
              placeholder="Digite sua mensagem..."
              showAvatarForEveryMessage={true}
              renderUsernameOnMessage={true}
              messagesContainerStyle={styles.messagesContainer}
              renderAvatar={(props) => (
                <Avatar.Image
                  size={40}
                  source={{ uri: props.currentMessage?.user.avatar || '' }}
                />
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  openButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  openButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#007bff",
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  closeButton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  messagesContainer: {
    flex: 1,
  },
});

export default ChatComponent;
