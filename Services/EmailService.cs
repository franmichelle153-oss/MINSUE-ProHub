using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;

namespace MINSUE_ProHub.Services
{
 public class EmailService
 {
 private readonly IConfiguration _config;

 public EmailService(IConfiguration config)
 {
 _config = config;
 }

 public async Task SendVerificationEmailAsync(string toEmail, string subject, string htmlMessage)
 {
 var smtp = _config.GetSection("Smtp");
 var host = smtp.GetValue<string>("Host");
 var port = smtp.GetValue<int>("Port");
 var user = smtp.GetValue<string>("User");
 var pass = smtp.GetValue<string>("Pass");
 var fromName = smtp.GetValue<string>("FromName");
 var fromEmail = smtp.GetValue<string>("FromEmail");

 var message = new MimeMessage();
 message.From.Add(new MailboxAddress(fromName, fromEmail));
 message.To.Add(MailboxAddress.Parse(toEmail));
 message.Subject = subject;

 var bodyBuilder = new BodyBuilder { HtmlBody = htmlMessage };
 message.Body = bodyBuilder.ToMessageBody();

 using var client = new SmtpClient();
 await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
 await client.AuthenticateAsync(user, pass);
 await client.SendAsync(message);
 await client.DisconnectAsync(true);
 }
 }
}