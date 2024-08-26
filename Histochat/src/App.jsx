import { useEffect, useState } from 'react'
import {CallGPT} from "./api/gpt"
import Userinput from './components/Userinput';
import styled from 'styled-components';
import {db} from './api/firebase'
import { collection, addDoc} from "firebase/firestore";

function App() {
  const [chatlog, setChatlog] = useState([]);
  const [data, setData] = useState("");
  
  const [user_name, setUserName] = useState("");
  const [user_interest, setUserInterest] = useState("");
  const [user_knowledge, setUserKnowledge] = useState("");
  const [user_name_flag, setUserNameFlag] = useState(false);

  const handleChat = (user1, user2) => {
    const chat = [
      { user: user_name, message: user1 },
      { user: "세종대왕", message: user2 },
    ];
    setChatlog(chatlog.concat(chat));
  };

  const [loading, setLoading] = useState(false);
  
  var chat_num = 1;

  const handleClickAPICall = async (userInput) => {
    try {
      setLoading(true);
      const message = await CallGPT({ prompt: userInput, pastchatlog: chatlog });
      handleChat(userInput, message);
      addDoc(collection(db, user_name+"vanila"), {
        chat_number : (chatlog.length)/2,
        input: userInput,
        output: message,
      });
    } catch (error) {
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  const handleSubmit = (userInput) => {
    console.log("user input", userInput);
    handleClickAPICall(userInput);
  };

  const handleUserNameInput = (e) => {
    setUserName(e.target.value);
  }

  const handleUserName = () => {
    if (user_name === "") {
      alert("이름을 입력해주세요");
      
    } else {
      setUserNameFlag(true);
      addDoc(collection(db, user_name+"vanila"), {
        name: user_name,
        interest: user_interest,
        knowledge: user_knowledge
      });
    }
  };


  const chatlogArray = chatlog.map((chat, index) => {
    return (
      <div key={index} style={{ textAlign: chat.user === user_name ? "right" : "left" }}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{chat.user}</div>
        <div style={{ background: chat.user === user_name ? "#C3C1C1" : "#8D8C8C", color : chat.user === user_name ? "#FFFFFF" : "#000000"
           ,padding: "10px", borderRadius: "10px", display: "inline-block", whiteSpace: "pre-line" }}>{chat.message}</div>
        <br />
      </div>
    );
  });
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      {user_name_flag ? (
          <AppConatiner>
          <h1>Histochat</h1>
          <div className="chatlog-container" style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", width : "600px", maxHeight: "1000px", overflowY: "scroll" }}>
            <div className="chatlog">{chatlogArray}</div>  
          </div>
          <br/>
          <div className="input-container" style={{width : "620px"}}>
            <Userinput isloading={loading} onSubmit={handleSubmit}/>
          </div>
        </AppConatiner>
      ) : (
        <div>
          <h1>Histochat</h1>
          <h3>이름을 입력해주세요</h3>
          <input type="text" value={user_name} onChange={handleUserNameInput}/>
          <button onClick={handleUserName}>입장</button>
        </div>
      )}
    </div>
  )

}
export default App;

const AppConatiner = styled.div`
  padding: 20px 20px 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  max-width: 800px;
  width : 100%
  margin : 0 auto;
`;
