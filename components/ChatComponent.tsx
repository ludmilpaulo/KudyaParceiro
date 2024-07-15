import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text, TextInput, Button, FlatList, Image, ListRenderItem } from "react-native";
import axios from "axios";
import { baseAPI } from '../services/types';

interface UserData {
  user_id: string;
  username: string;
  avatar?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface ChatComponentProps {
  user?: string;
  accessToken: string;
  orderId: string;
  userData: UserData;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user = "driver", accessToken, orderId, userData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const fetchChatMessages = async () => {
    try {
      console.log("Fetching chat messages for order ID:", orderId);
      const response = await axios.get(`${baseAPI}/info/get_order_chat/${orderId}/`);
      console.log("Chat messages fetched:", response.data);
      const chatMessages = response.data.map((chatMessage: any) => ({
        id: chatMessage.id,
        text: chatMessage.message,
        createdAt: new Date(chatMessage.timestamp),
        user: {
          id: chatMessage.sender,
          name: chatMessage.sender_username,
          avatar: chatMessage.sender.avatar ? `${baseAPI}${chatMessage.sender.avatar}` : '',
        },
      }));
      console.log("Formatted messages:", chatMessages);
      setMessages(chatMessages.reverse());
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [orderId]);

  const handleSend = async () => {
    if (text.trim() === "") return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      createdAt: new Date(),
      user: {
        id: userData.user_id,
        name: userData.username,
        avatar: userData.avatar ? `${baseAPI}${userData.avatar}` : '',
      },
    };

    try {
      console.log("Sending new message:", newMessage);
      await axios.post(`${baseAPI}/info/send_chat_message/`, {
        user_id: userData.user_id,
        order_id: orderId,
        message: newMessage.text,
      });
      console.log("Message sent successfully");
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessageItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <View style={styles.messageContainer}>
      <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={styles.username}>{item.user.name}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.createdAt.toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="gray"
        />
        <Button title="Enviar" onPress={handleSend} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  username: {
    fontWeight: "bold",
  },
  messageText: {
    color: "black",
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "black",
  },
});

export default ChatComponent;
