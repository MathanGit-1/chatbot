using chatbot_api.Models;
using chatbot_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace chatbot_api.Controllers
{
    [Route("api/chatbot")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly DatabaseService _dbService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ChatbotController(IConfiguration configuration)
        {
            _configuration = configuration;
            _dbService = new DatabaseService(configuration);
            _httpClient = new HttpClient();
        }

        [HttpPost]
        public async Task<IActionResult> GetChatbotResponse([FromBody] ChatQuery query)
        {
            if (query == null || string.IsNullOrWhiteSpace(query.Message))
            {
                return BadRequest(new { error = "Invalid request. Message is required." });
            }

            try
            {
                // Fetch rule-based response
                string ruleResponse = await _dbService.GetRuleBasedResponseAsync(query.Message);
                if (!string.IsNullOrEmpty(ruleResponse))
                {
                    return Ok(new { response = ruleResponse });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred.", details = ex.Message });
            }
        }
    }

    public class ChatQuery
    {
        public string Message { get; set; }
    }
}
