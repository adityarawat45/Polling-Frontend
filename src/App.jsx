import { useEffect, useState } from "react";
import { api } from "./api";
import { socket } from "./socket";

function App() {
  const [poll, setPoll] = useState(null);
  const [pollId, setPollId] = useState("");
  const userId = "64b9c9f4c2e4a8a9f1c11112"; // fake user

  useEffect(() => {
    socket.on("joined_poll", data => {
      setPoll(data);
    });

    socket.on("poll_update", data => {
      setPoll(prev => ({
        ...prev,
        options: data.options
      }));
    });

    socket.on("error", err => {
      alert(err.message);
    });

    return () => {
      socket.off();
    };
  }, []);

  const createPoll = async () => {
    const res = await api.post("/api/polls", {
      question: "Best backend?",
      options: [
        { _id: "node", text: "Node.js" },
        { _id: "go", text: "Go" }
      ],
      expiresAt: "2026-12-31T23:59:59.000Z",
      createdBy: userId
    });

    setPollId(res.data._id);
    alert("Poll created");
  };

  const joinPoll = () => {
    socket.connect();
    socket.emit("join_poll", { pollId });
  };

  const vote = optionId => {
    socket.emit("vote", {
      pollId,
      optionId,
      userId
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Polling Test UI</h1>

      <button onClick={createPoll}>Create Poll</button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Poll ID"
          value={pollId}
          onChange={e => setPollId(e.target.value)}
          style={{ width: 400 }}
        />
        <button onClick={joinPoll}>Join Poll</button>
      </div>

      {poll && (
        <div style={{ marginTop: 20 }}>
          <h2>{poll.question}</h2>
          {poll.options.map(opt => (
            <div key={opt._id}>
              <button onClick={() => vote(opt._id)}>
                {opt.text}
              </button>
              <span style={{ marginLeft: 10 }}>
                Votes: {opt.votes}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
