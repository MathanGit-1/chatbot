using chatbot_api.Models;
using Microsoft.EntityFrameworkCore;

namespace chatbot_api.Models
{
    public class ChatbotDbContext : DbContext
    {
        public ChatbotDbContext(DbContextOptions<ChatbotDbContext> options) : base(options) { }

        public DbSet<ChatbotRule> ChatbotRules { get; set; }
    }
}