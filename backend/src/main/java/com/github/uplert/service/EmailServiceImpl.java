package com.github.uplert.service;

import com.github.uplert.model.EmailDetails;
import org.springframework.stereotype.Service;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

@Service
public class EmailServiceImpl implements EmailService{
    @Override
    public String sendEmail(EmailDetails details) {
        try {
            System.out.println("TLSEmail Start");
            Properties props = new Properties();
            props.put("mail.smtp.host", "smtp.gmail.com");
            props.put("mail.smtp.port", "587");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            Session session = Session.getInstance(props,
                    new Authenticator() {
                        @Override
                        protected PasswordAuthentication getPasswordAuthentication() {
                            return new PasswordAuthentication("amanupadhyay2004@gmail.com", "");
                        }
                    });

            sendEmail(session, "amanupadhyay2004@gmail.com", details.getRecipient(), details.getSubject(), details.getMsgBody());
            return "Email Sent Successfully";
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return "Error while Sending Mail";
        }
    }
    public static void sendEmail(Session session, String fromEmail, String toEmail, String subject, EmailDetails.BodyData body){
        try
        {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail, "Uplert"));
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
            message.setSubject(subject);
            message.setContent(body, "text/html; charset=utf-8");
            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang='en'>"
                    + "<head>"
                    + "  <meta charset='UTF-8'>"
                    + "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                    + "  <title>Website Down Alert</title>"
                    + "  <style>"
                    + "    body {"
                    + "      margin: 0;"
                    + "      padding: 0;"
                    + "      font-family: 'Helvetica Neue', Arial, sans-serif;"
                    + "      background: linear-gradient(135deg, #2c3e50, #bdc3c7);"
                    + "      color: #333;"
                    + "    }"
                    + "    .container {"
                    + "      display: flex;"
                    + "      justify-content: center;"
                    + "      align-items: center;"
                    + "      height: 100vh;"
                    + "      padding: 20px;"
                    + "    }"
                    + "    .alert-box {"
                    + "      background: #fff;"
                    + "      border-radius: 8px;"
                    + "      padding: 30px;"
                    + "      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);"
                    + "      text-align: center;"
                    + "      max-width: 600px;"
                    + "      width: 100%;"
                    + "    }"
                    + "    h1 {"
                    + "      color: #e74c3c;"
                    + "      font-size: 2.5em;"
                    + "      margin-bottom: 20px;"
                    + "    }"
                    + "    p {"
                    + "      font-size: 1.2em;"
                    + "      margin: 10px 0;"
                    + "    }"
                    + "    .highlight {"
                    + "      color: #3498db;"
                    + "      font-weight: bold;"
                    + "    }"
                    + "    .footer {"
                    + "      margin-top: 20px;"
                    + "      font-size: 0.9em;"
                    + "      color: #777;"
                    + "    }"
                    + "  </style>"
                    + "</head>"
                    + "<body>"
                    + "  <div class='container'>"
                    + "    <div class='alert-box'>"
                    + "      <h1>Website Alert</h1>"
                    + "      <p>Your website <span class='highlight'>{WEBSITE_NAME}</span> appears to be down.</p>"
                    + "      <p>Status Code: <span class='highlight'>{STATUS_CODE}</span></p>"
                    + "      <p>Response Time: <span class='highlight'>{RESPONSE_TIME} ms</span></p>"
                    + "      <p class='footer'>If the issue persists, please contact your support team.</p>"
                    + "    </div>"
                    + "  </div>"
                    + "</body>"
                    + "</html>";

            htmlContent = htmlContent
                    .replace("{WEBSITE_NAME}", body.getUrl())
                    .replace("{STATUS_CODE}", body.getStatusCode())
                    .replace("{RESPONSE_TIME}", body.getResponseTime());
            message.setContent(htmlContent, "text/html; charset=utf-8");
            Transport.send(message);
            System.out.println("EMail Sent Successfully!!");
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}