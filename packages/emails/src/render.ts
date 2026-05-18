import express from "express";
import { render } from "@react-email/render";
import ResetPasswordEmail from "../emails/reset-password";
import WelcomeEmail from "../emails/welcome";
import { JSX } from "react";

const app = express();
app.use(express.json());

const PORT = process.env.EMAIL_RENDER_PORT || 3001;

const templates: Record<string, (props: any) => JSX.Element> = {
  "reset-password": ResetPasswordEmail,
  welcome: WelcomeEmail,
};

app.post("/render", async (req, res) => {
  const { template, props } = req.body;

  if (!template || !templates[template]) {
    return res.status(400).json({ error: `Unknown template: ${template}` });
  }

  try {
    const Component = templates[template];
    const html = await render(Component(props));
    res.json({ html });
  } catch (err) {
    console.error("Render error:", err);
    res.status(500).json({ error: "Render failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Email render service running on :${PORT}`);
});
