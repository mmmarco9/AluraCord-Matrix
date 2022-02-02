import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { createClient } from "@supabase/supabase-js";
import { Box, TextField } from "@skynexui/components";

import appConfig from "../../config.json";
import { Header } from "../Components/Header";
import { MessageList } from "../Components/MessageList";
import { ButtonSendSticker } from "../../src/Components/Styckers";

const SUPABASE_ANON_KEY = "key";
const SUPABASE_URL = "URL";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function msgRealTime(addMessage) {
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (response) => {
      addMessage(response.new);
    })
    .subscribe();
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [listMessage, setListMessage] = useState([]);
  const router = useRouter();
  const userLogged = router.query.username;

  useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setListMessage(data);
      });

    const subscription = msgRealTime((newMessage) => {
      setListMessage((valueCurrentList) => {
        return [newMessage, ...valueCurrentList];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function handleNewMessage(newMessage) {
    const message = {
      de: userLogged,
      texto: newMessage,
    };

    supabaseClient
      .from("mensagens")
      .insert([message])
      .then(({ data }) => {
        console.log("create message", data);
      });

    setMessage("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[1000],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList messages={listMessage} />
        
          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={message}
              onChange={(event) => {
                const valor = event.target.value;
                setMessage(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNewMessage(message);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(":sticker:" + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
