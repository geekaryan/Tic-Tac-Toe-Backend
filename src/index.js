import express from "express";
import cors from "cors";
import { StreamChat } from "stream-chat";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const app = express();

app.use(cors());
app.use(express.json());

const api_key = "d9psjbg67mf5";
const api_secret =
  "svrn24wf2hcjfk5z2t2pufjnu6ctt85yqjk9bg56bbhj5jbtmftkwq5hsy6qan99";

const serverClient = StreamChat.getInstance(api_key, api_secret);

app.post("/singup", async (req, res) => {
  try {
    const { firstName, lastName, userName, password } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = serverClient.createToken(userId);
    res.status(200).json({
      status: "success",
      token,
      firstName,
      userId,
      lastName,
      userName,
      hashedPassword,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const { users } = await serverClient.queryUsers({ name: userName });
    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = serverClient.createToken(users[0].id);
    const passwordMatch = await bcrypt.compare(
      password,
      users[0].hashedPassword
    );

    if (passwordMatch) {
      res.status(200).json({
        token,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        userName,
        userId: users[0].id,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
