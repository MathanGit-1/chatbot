using System;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;


namespace chatbot_api.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("ChatbotDBConnection")
                            ?? throw new ArgumentNullException(nameof(_connectionString));

        }

        public async Task<string> GetRuleBasedResponseAsync(string userQuery)
        {
            string response = null;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();

                // Using LIKE for partial match
                string query = "SELECT TOP 1 Response FROM ChatbotRules WHERE Query LIKE '%' + @Query + '%'";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Query", userQuery);
                    var result = await cmd.ExecuteScalarAsync();
                    response = result?.ToString();
                }
            }

            return response;
        }
    }
}
