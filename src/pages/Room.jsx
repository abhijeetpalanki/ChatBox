import { useState, useEffect } from "react";
import client, {
  COLLECTION_ID_MESSAGES,
  DATABASE_ID,
  databases,
} from "../appwriteConfig";
import { ID, Permission, Query, Role } from "appwrite";
import { Trash2 } from "react-feather";
import { useAuth } from "../utils/AuthContext";
import Header from "../components/Header";

const Room = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    getMessages();

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTION_ID_MESSAGES}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          setMessages((prevMessages) => [response.payload, ...prevMessages]);
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.$id !== response.payload.$id)
          );
        }
      }
    );

    // clean up function
    return () => {
      unsubscribe();
    };
  }, []);

  const getMessages = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_MESSAGES,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );
    setMessages(response.documents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      user_id: user.$id,
      username: user.name,
      body: messageBody,
    };

    let permissions = [Permission.write(Role.user(user.$id))];

    await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID_MESSAGES,
      ID.unique(),
      payload,
      permissions
    );
    setMessageBody("");
  };

  const deleteMessage = async (message_id) => {
    databases.deleteDocument(DATABASE_ID, COLLECTION_ID_MESSAGES, message_id);
  };

  return (
    <main className="container">
      <Header />
      <div className="room--container">
        <form id="message--form" onSubmit={handleSubmit}>
          <div>
            <textarea
              required
              maxLength={1000}
              placeholder="Say something..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
            ></textarea>
          </div>

          <div className="send-btn--wrapper">
            <input className="btn btn--secondary" type="submit" value="Send" />
          </div>
        </form>

        <div>
          {messages.map((msg) => (
            <div key={msg.$id} className="message--wrapper">
              <div className="message--header">
                <p>
                  {msg?.username ? (
                    <span>{msg.username}</span>
                  ) : (
                    <span>Anonymous User</span>
                  )}
                  <small className="message--timestamp">
                    {new Date(msg.$createdAt).toLocaleString()}
                  </small>
                </p>

                {msg.$permissions.includes(`delete("user:${user.$id}")`) && (
                  <Trash2
                    className="delete--btn"
                    onClick={() => deleteMessage(msg.$id)}
                  />
                )}
              </div>

              <div className="message--body">
                <span>{msg.body}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Room;
