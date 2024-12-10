using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using VoiceChatApp.Models;
using AssemblyAI;
using AssemblyAI.Transcripts;
using System.Text;
using Newtonsoft.Json;
using System.Text.Json;
using RestSharp;
using Microsoft.AspNetCore.Diagnostics;

namespace VoiceChatApp.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly HttpClient _httpClient;

    public HomeController(ILogger<HomeController> logger, HttpClient httpClient)
    {
        _logger = logger;
        _httpClient = httpClient;
    }

    public IActionResult Index()
    {
        return View();
    }


    private static readonly string ApiKey = "nnefkIIyYY5OrvDPNDXI8QzsgQDBHzVg2AnjCwB0";
    private static readonly string BaseUrl = "https://api.cohere.com/v2/chat";
    [HttpPost]
    public async Task<IActionResult> ChatAi(string userMessage)
    {
        HttpClientHandler handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;

        using (var client = new HttpClient(handler))
        {
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {ApiKey}");

            var chatRequest = new
            {
                model = "command-r-plus-08-2024",
                messages = new[] {
                new { role = "user", content = userMessage }
            }
            };

            var content = new StringContent(JsonConvert.SerializeObject(chatRequest), Encoding.UTF8, "application/json");

            try
            {
                // لاگ کردن درخواست ارسالی
                _logger.LogInformation("Sending request to Cohere API with message: {userMessage}", userMessage);

                var response = await client.PostAsync(BaseUrl, content);
                var responseData = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // بررسی null بودن و لاگ کردن پاسخ موفق
                    dynamic jsonResponse = JsonConvert.DeserializeObject(responseData);

                    if (jsonResponse != null &&
                        jsonResponse["message"] != null &&
                        jsonResponse["message"]["content"] != null &&
                        jsonResponse["message"]["content"].Count > 0 &&
                        jsonResponse["message"]["content"][0]["text"] != null)
                    {
                        var resultText = jsonResponse["message"]["content"][0]["text"].ToString();

                        // لاگ کردن متن پاسخ دریافت شده

                        return Ok(resultText);
                    }
                    else
                    {
                        // لاگ کردن خطای دریافت پاسخ معتبر
                        _logger.LogWarning("Received invalid response: No valid text found in the response.");
                        return BadRequest("پاسخ معتبر از API دریافت نشد.");
                    }
                }
                else
                {
                    // لاگ کردن خطای API
                    _logger.LogError("API request failed with status code: {statusCode}. Response: {responseData}",
                        response.StatusCode, responseData);
                    throw new Exception("خطا در ارتباط با Cohere API: " + responseData);
                }
            }
            catch (Exception ex)
            {
                // لاگ کردن استثنا
                _logger.LogError("An error occurred while processing the request: {errorMessage}", ex.Message);
                throw;
            }
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
