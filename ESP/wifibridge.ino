#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_NeoPixel.h>

// ===== CONFIGURATION =====
// WiFi Credentials
#define WIFI_SSID     "YourWiFiSSID"
#define WIFI_PASSWORD "YourWiFiPassword"

// API Configuration
#define API_URL "https://canteenapp-bwii.onrender.com/api/canteens/"
#define CANTEEN_ID "69756be8c3d5179b393f105b"
#define SECRET_KEY "toggle_canteen_secret_2024"

// Hardware Pins
#define LED_PIN       4     // WS2812B data pin (moved from 26)
#define LED_COUNT     9     // Number of LEDs

// LoRa Pins (ESP32) - RA-02 Module
#define LORA_SCK      18    // SCK
#define LORA_MISO     19    // MISO
#define LORA_MOSI     23    // MOSI
#define LORA_SS       5     // NSS
#define LORA_RST      14    // RESET
#define LORA_DIO0     2     // DIO0

// OLED Configuration
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C

// ===== OBJECTS =====
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

String apiEndpoint = String(API_URL) + String(CANTEEN_ID) + "/toggle-status";

// ===== VARIABLES =====
bool wifiConnected = false;
int currentLED = 0;
unsigned long lastLEDUpdate = 0;
bool loraInitialized = false;

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== LoRa Receiver (WiFi Bridge) ===");
  
  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println(F("LoRa Receiver"));
    display.println(F("WiFi Bridge"));
    display.println(F("Starting..."));
    display.display();
  }
  
  // Initialize NeoPixels
  strip.begin();
  strip.setBrightness(50);
  strip.show();
  
  // Initialize LoRa
  initLoRa();
  
  // Connect to WiFi
  connectToWiFi();
  
  if (wifiConnected && loraInitialized) {
    Serial.println("\n✅ System Ready - Listening for LoRa packets");
    updateDisplay("System Ready", "WiFi: OK", "LoRa: Listening");
  } else {
    Serial.println("\n⚠️ System started with errors");
    updateDisplay("System Error", 
                  wifiConnected ? "WiFi: OK" : "WiFi: FAILED",
                  loraInitialized ? "LoRa: OK" : "LoRa: FAILED");
  }
}

// ===== LORA INITIALIZATION =====
void initLoRa() {
  Serial.println("Initializing LoRa...");
  
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  
  if (!LoRa.begin(433E6)) {  // 433 MHz frequency
    Serial.println("❌ LoRa init failed!");
    loraInitialized = false;
    updateDisplay("LoRa: FAILED", "", "");
    setAllLEDs(strip.Color(255, 0, 0));
  } else {
    Serial.println("✅ LoRa initialized");
    LoRa.setSpreadingFactor(12);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    loraInitialized = true;
    updateDisplay("LoRa: OK", "Receiving...", "");
    delay(1000);
  }
}

// ===== WIFI CONNECTION =====
void connectToWiFi() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  updateDisplay("Connecting", "WiFi...", "");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    
    // Rotating red LEDs for loading effect
    rotateLoadingLEDs(strip.Color(255, 0, 0));
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    wifiConnected = true;
    
    // Set all LEDs to stable green
    setAllLEDs(strip.Color(0, 255, 0));
    
    updateDisplay("WiFi: Connected", WiFi.localIP().toString().c_str(), "Ready!");
  } else {
    Serial.println("\n❌ WiFi Failed");
    wifiConnected = false;
    
    // Set all LEDs to stable red
    setAllLEDs(strip.Color(255, 0, 0));
    
    updateDisplay("WiFi: FAILED", "Cannot bridge", "Check config");
  }
}

// ===== LED FUNCTIONS =====
void rotateLoadingLEDs(uint32_t color) {
  strip.clear();
  strip.setPixelColor(currentLED, color);
  strip.show();
  currentLED = (currentLED + 1) % LED_COUNT;
}

void setAllLEDs(uint32_t color) {
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, color);
  }
  strip.show();
}

void flashLEDs(uint32_t color, int times) {
  for (int i = 0; i < times; i++) {
    setAllLEDs(color);
    delay(200);
    strip.clear();
    strip.show();
    delay(200);
  }
  
  // Restore WiFi status color
  if (wifiConnected) {
    setAllLEDs(strip.Color(0, 255, 0));
  } else {
    setAllLEDs(strip.Color(255, 0, 0));
  }
}

// ===== DISPLAY FUNCTIONS =====
void updateDisplay(const char* line1, const char* line2, const char* line3) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  
  display.println(line1);
  display.println();
  display.println(line2);
  display.println();
  display.println(line3);
  
  display.display();
}

void updateDisplayWithRSSI(const char* line1, int rssi) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  
  display.println(line1);
  display.println();
  display.print("RSSI: ");
  display.print(rssi);
  display.println(" dBm");
  display.println();
  display.println("Processing...");
  
  display.display();
}

// ===== TOGGLE CANTEEN VIA WIFI =====
void toggleCanteenWiFi() {
  if (!wifiConnected) {
    Serial.println("❌ WiFi not connected");
    updateDisplay("Error", "WiFi offline", "Cannot send");
    flashLEDs(strip.Color(255, 0, 0), 2);
    return;
  }
  
  HTTPClient http;
  
  Serial.println("🔄 Forwarding to server...");
  updateDisplay("Forwarding...", "To Server", "");
  
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  
  String jsonBody = "{\"secretKey\":\"" + String(SECRET_KEY) + "\"}";
  int httpCode = http.POST(jsonBody);
  
  if (httpCode > 0) {
    Serial.printf("HTTP Code: %d\n", httpCode);
    
    if (httpCode == HTTP_CODE_OK || httpCode == 200) {
      String response = http.getString();
      Serial.println("✅ Success: " + response);
      updateDisplay("Success!", "Toggled", "via Bridge");
      flashLEDs(strip.Color(0, 255, 0), 3); // Green flash
    } else {
      Serial.println("⚠️ HTTP Error");
      char errorMsg[20];
      sprintf(errorMsg, "HTTP %d", httpCode);
      updateDisplay("Error", errorMsg, "");
      flashLEDs(strip.Color(255, 165, 0), 2); // Orange flash
    }
  } else {
    Serial.println("❌ Request failed");
    updateDisplay("Failed", "Server Error", "");
    flashLEDs(strip.Color(255, 0, 0), 2); // Red flash
  }
  
  http.end();
  
  delay(2000);
  updateDisplay("Listening", "for LoRa", "Ready!");
}

// ===== HANDLE LORA PACKET =====
void handleLoRaPacket() {
  int packetSize = LoRa.parsePacket();
  
  if (packetSize) {
    Serial.println("\n📡 LoRa packet received!");
    
    String receivedData = "";
    while (LoRa.available()) {
      receivedData += (char)LoRa.read();
    }
    
    int rssi = LoRa.packetRssi();
    float snr = LoRa.packetSnr();
    
    Serial.println("Data: " + receivedData);
    Serial.printf("RSSI: %d dBm, SNR: %.2f dB\n", rssi, snr);
    
    updateDisplayWithRSSI("Received!", rssi);
    flashLEDs(strip.Color(0, 0, 255), 2); // Blue flash
    
    delay(500);
    
    // Verify the packet contains correct secret key
    if (receivedData.startsWith("TOGGLE:")) {
      String receivedKey = receivedData.substring(7);
      
      if (receivedKey == SECRET_KEY) {
        Serial.println("✅ Valid toggle command");
        toggleCanteenWiFi();
      } else {
        Serial.println("❌ Invalid secret key");
        updateDisplay("Error", "Invalid Key", "Rejected");
        flashLEDs(strip.Color(255, 0, 0), 3);
        delay(2000);
        updateDisplay("Listening", "for LoRa", "Ready!");
      }
    } else {
      Serial.println("❌ Unknown command format");
      updateDisplay("Error", "Unknown Format", "Rejected");
      flashLEDs(strip.Color(255, 165, 0), 2);
      delay(2000);
      updateDisplay("Listening", "for LoRa", "Ready!");
    }
  }
}

// ===== MAIN LOOP =====
void loop() {
  // Listen for LoRa packets
  if (loraInitialized) {
    handleLoRaPacket();
  }
  
  // Check WiFi status periodically
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 30000) {
    if (WiFi.status() != WL_CONNECTED && wifiConnected) {
      Serial.println("⚠️ WiFi disconnected, attempting reconnect...");
      wifiConnected = false;
      setAllLEDs(strip.Color(255, 165, 0)); // Orange
      connectToWiFi();
    } else if (WiFi.status() == WL_CONNECTED && !wifiConnected) {
      Serial.println("✅ WiFi reconnected");
      wifiConnected = true;
      setAllLEDs(strip.Color(0, 255, 0));
      updateDisplay("Listening", "for LoRa", "Ready!");
    }
    lastWiFiCheck = millis();
  }
  
  delay(10);
}