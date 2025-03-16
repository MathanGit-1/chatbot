using System.ComponentModel.DataAnnotations;

namespace chatbot_api.Models
{
    public class ChatbotRule
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Query { get; set; }

        [Required]
        public string Response { get; set; }
    }
}
