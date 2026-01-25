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
#define WIFI_SSID     "Whyn3gg3r"
#define WIFI_PASSWORD "useownhotspotbiatch"

// API Configuration
#define API_URL "https://backenddeployagainhackiiit.onrender.com/api/canteens/6975f7e3deaf3d3a4cd8b654/toggle-status"
#define SECRET_KEY "toggle_canteen_secret_2024"

// Hardware Pins
#define BUTTON_PIN    25
#define LED_PIN       4
#define LED_COUNT     9

// LoRa Pins
#define LORA_SCK      18
#define LORA_MISO     19
#define LORA_MOSI     23
#define LORA_SS       5
#define LORA_RST      14
#define LORA_DIO0     2

// OLED Configuration
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define SCREEN_ADDRESS 0x3C

// ===== OBJECTS =====
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

// ===== VARIABLES =====
bool wifiConnected = false;
int currentLED = 0;
unsigned long lastLEDUpdate = 0;
unsigned long lastButtonCheck = 0;
bool lastButtonState = HIGH;
bool loraInitialized = false;
int animFrame = 0;

// ===== ENHANCED DISPLAY FUNCTIONS =====

// Draw a centered title bar
void drawTitleBar(const char* title) {
  display.fillRect(0, 0, SCREEN_WIDTH, 12, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setTextSize(1);
  int16_t x = (SCREEN_WIDTH - (strlen(title) * 6)) / 2;
  display.setCursor(x, 2);
  display.print(title);
  display.setTextColor(SSD1306_WHITE);
}

// Draw WiFi signal strength icon
void drawWiFiIcon(int x, int y, bool connected) {
  if (connected) {
    int rssi = WiFi.RSSI();
    int bars = 0;
    if (rssi > -60) bars = 4;
    else if (rssi > -70) bars = 3;
    else if (rssi > -80) bars = 2;
    else bars = 1;
    
    for (int i = 0; i < bars; i++) {
      int h = (i + 1) * 2;
      display.fillRect(x + (i * 3), y + (8 - h), 2, h, SSD1306_WHITE);
    }
  } else {
    // Draw X for no connection
    display.drawLine(x, y, x + 8, y + 8, SSD1306_WHITE);
    display.drawLine(x + 8, y, x, y + 8, SSD1306_WHITE);
  }
}

// Draw LoRa icon
void drawLoRaIcon(int x, int y, bool active) {
  if (active) {
    // Draw antenna waves
    display.drawCircle(x + 4, y + 4, 2, SSD1306_WHITE);
    display.drawCircle(x + 4, y + 4, 4, SSD1306_WHITE);
    display.drawCircle(x + 4, y + 4, 6, SSD1306_WHITE);
  } else {
    display.drawRect(x, y, 8, 8, SSD1306_WHITE);
    display.drawLine(x, y, x + 8, y + 8, SSD1306_WHITE);
  }
}

// Status screen with icons
void showStatusScreen() {
  display.clearDisplay();
  
  // Title
  drawTitleBar("CANTEEN TOGGLE");
  
  // WiFi Status
  display.setCursor(0, 16);
  display.setTextSize(1);
  display.print("WiFi:");
  drawWiFiIcon(35, 16, wifiConnected);
  if (wifiConnected) {
    display.setCursor(50, 16);
    display.print("Connected");
  } else {
    display.setCursor(50, 16);
    display.print("Offline");
  }
  
  // LoRa Status
  display.setCursor(0, 28);
  display.print("LoRa:");
  drawLoRaIcon(35, 28, loraInitialized);
  if (loraInitialized) {
    display.setCursor(50, 28);
    display.print("Ready");
  } else {
    display.setCursor(50, 28);
    display.print("Error");
  }
  
  // Divider line
  display.drawLine(0, 42, SCREEN_WIDTH, 42, SSD1306_WHITE);
  
  // Mode indicator
  display.setTextSize(1);
  display.setCursor(0, 48);
  display.print("Mode: ");
  if (wifiConnected) {
    display.print("WiFi");
  } else if (loraInitialized) {
    display.print("LoRa");
  } else {
    display.print("ERROR");
  }
  
  // Ready message
  display.setCursor(0, 56);
  display.print("Press to toggle");
  
  display.display();
}

// Animated loading screen
void showLoadingScreen(const char* message, int progress) {
  display.clearDisplay();
  drawTitleBar("LOADING");
  
  // Message
  display.setTextSize(1);
  int16_t x = (SCREEN_WIDTH - (strlen(message) * 6)) / 2;
  display.setCursor(x, 24);
  display.print(message);
  
  // Progress bar
  int barWidth = 100;
  int barX = (SCREEN_WIDTH - barWidth) / 2;
  display.drawRect(barX, 40, barWidth, 8, SSD1306_WHITE);
  int fillWidth = (progress * (barWidth - 4)) / 100;
  display.fillRect(barX + 2, 42, fillWidth, 4, SSD1306_WHITE);
  
  // Percentage
  display.setCursor(56, 52);
  display.print(progress);
  display.print("%");
  
  display.display();
}

// Spinning animation for operations
void showOperationScreen(const char* operation, const char* method) {
  display.clearDisplay();
  drawTitleBar(operation);
  
  // Method
  display.setTextSize(1);
  display.setCursor(0, 20);
  display.print("Via: ");
  display.print(method);
  
  // Spinning animation
  int centerX = SCREEN_WIDTH / 2;
  int centerY = 45;
  int radius = 8;
  
  for (int i = 0; i < 8; i++) {
    float angle = (animFrame * 45 + i * 45) * PI / 180.0;
    int x = centerX + cos(angle) * radius;
    int y = centerY + sin(angle) * radius;
    int size = (i == 0) ? 3 : 1;
    display.fillCircle(x, y, size, SSD1306_WHITE);
  }
  
  animFrame = (animFrame + 1) % 8;
  
  display.display();
}

// Success screen with checkmark
void showSuccessScreen(const char* method) {
  display.clearDisplay();
  drawTitleBar("SUCCESS!");
  
  // Large checkmark
  display.drawLine(40, 35, 50, 45, SSD1306_WHITE);
  display.drawLine(50, 45, 80, 25, SSD1306_WHITE);
  display.drawLine(41, 35, 51, 45, SSD1306_WHITE);
  display.drawLine(51, 45, 81, 25, SSD1306_WHITE);
  
  // Method
  display.setTextSize(1);
  int16_t x = (SCREEN_WIDTH - (strlen(method) * 6)) / 2;
  display.setCursor(x, 52);
  display.print(method);
  
  display.display();
}

// Error screen with X
void showErrorScreen(const char* errorMsg) {
  display.clearDisplay();
  drawTitleBar("ERROR");
  
  // Large X
  display.drawLine(40, 25, 80, 45, SSD1306_WHITE);
  display.drawLine(80, 25, 40, 45, SSD1306_WHITE);
  display.drawLine(41, 25, 81, 45, SSD1306_WHITE);
  display.drawLine(81, 25, 41, 45, SSD1306_WHITE);
  
  // Error message
  display.setTextSize(1);
  int16_t x = (SCREEN_WIDTH - (strlen(errorMsg) * 6)) / 2;
  display.setCursor(x, 52);
  display.print(errorMsg);
  
  display.display();
}

// Info screen for startup
void showInfoScreen(const char* line1, const char* line2, const char* line3) {
  display.clearDisplay();
  drawTitleBar("SYSTEM INFO");
  
  display.setTextSize(1);
  display.setCursor(0, 20);
  display.println(line1);
  display.println();
  display.println(line2);
  display.println();
  display.println(line3);
  
  display.display();
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
  } else {
    showInfoScreen("Initializing...", "Please wait", "");
  }
  
  // Initialize NeoPixels
  strip.begin();
  strip.setBrightness(50);
  strip.show();
  
  // Initialize LoRa
  initLoRa();
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("\n=== System Ready ===");
  showStatusScreen();
}

// ===== LORA INITIALIZATION =====
void initLoRa() {
  Serial.println("Initializing LoRa...");
  showInfoScreen("Initializing", "LoRa Module...", "");
  
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
  
  if (!LoRa.begin(433E6)) {
    Serial.println("❌ LoRa init failed!");
    loraInitialized = false;
    showErrorScreen("LoRa Failed");
    delay(2000);
  } else {
    Serial.println("✅ LoRa initialized");
    LoRa.setSpreadingFactor(12);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(5);
    loraInitialized = true;
    showSuccessScreen("LoRa Ready");
    delay(1000);
  }
}

// ===== WIFI CONNECTION =====
void connectToWiFi() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    
    showLoadingScreen("Connecting WiFi", (attempts * 100) / 30);
    rotateLoadingLEDs(strip.Color(255, 0, 0));
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    wifiConnected = true;
    setAllLEDs(strip.Color(0, 255, 0));
    
    showSuccessScreen("WiFi Connected");
    delay(2000);
  } else {
    Serial.println("\n❌ WiFi Failed");
    wifiConnected = false;
    setAllLEDs(strip.Color(255, 0, 0));
    
    showErrorScreen("WiFi Failed");
    delay(2000);
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
  
  if (wifiConnected) {
    setAllLEDs(strip.Color(0, 255, 0));
  } else {
    setAllLEDs(strip.Color(255, 0, 0));
  }
}

// ===== TOGGLE CANTEEN VIA WIFI =====
bool toggleCanteenWiFi() {
  if (!wifiConnected) {
    return false;
  }
  
  HTTPClient http;
  
  Serial.println("🔄 Sending WiFi request...");
  
  // Show operation screen with animation
  for (int i = 0; i < 5; i++) {
    showOperationScreen("SENDING", "WiFi");
    delay(100);
  }
  
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  
  String jsonBody = "{\"secretKey\":\"" + String(SECRET_KEY) + "\"}";
  int httpCode = http.POST(jsonBody);
  
  bool success = false;
  
  if (httpCode > 0) {
    Serial.printf("HTTP Code: %d\n", httpCode);
    
    if (httpCode == HTTP_CODE_OK || httpCode == 200) {
      String response = http.getString();
      Serial.println("✅ Success: " + response);
      showSuccessScreen("WiFi Success");
      flashLEDs(strip.Color(0, 0, 255), 3);
      success = true;
    } else {
      Serial.println("⚠️ HTTP Error");
      char errorMsg[20];
      sprintf(errorMsg, "HTTP %d", httpCode);
      showErrorScreen(errorMsg);
      flashLEDs(strip.Color(255, 165, 0), 2);
    }
  } else {
    Serial.println("❌ Request failed");
    showErrorScreen("WiFi Error");
    flashLEDs(strip.Color(255, 0, 0), 2);
  }
  
  http.end();
  
  delay(2000);
  showStatusScreen();
  
  return success;
}

// ===== TOGGLE CANTEEN VIA LORA =====
void toggleCanteenLoRa() {
  if (!loraInitialized) {
    Serial.println("❌ LoRa not initialized");
    showErrorScreen("LoRa Error");
    return;
  }
  
  Serial.println("📡 Sending LoRa request...");
  
  // Show operation screen with animation
  for (int i = 0; i < 5; i++) {
    showOperationScreen("SENDING", "LoRa");
    delay(100);
  }
  
  LoRa.beginPacket();
  LoRa.print("TOGGLE:");
  LoRa.print(SECRET_KEY);
  LoRa.endPacket();
  
  Serial.println("✅ LoRa packet sent");
  showSuccessScreen("LoRa Sent");
  
  flashLEDs(strip.Color(255, 255, 0), 3);
  
  delay(2000);
  showStatusScreen();
}

// ===== HANDLE BUTTON PRESS =====
void handleButtonPress() {
  bool buttonState = digitalRead(BUTTON_PIN);
  
  if (millis() - lastButtonCheck < 200) {
    return;
  }
  
  if (buttonState == LOW && lastButtonState == HIGH) {
    Serial.println("\n🔘 Button Pressed!");
    
    if (wifiConnected) {
      bool success = toggleCanteenWiFi();
      if (!success) {
        Serial.println("WiFi failed, trying LoRa...");
        toggleCanteenLoRa();
      }
    } else {
      toggleCanteenLoRa();
    }
    
    lastButtonCheck = millis();
  }
  
  lastButtonState = buttonState;
}

// ===== MAIN LOOP =====
void loop() {
  handleButtonPress();
  
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 30000) {
    if (WiFi.status() != WL_CONNECTED && wifiConnected) {
      Serial.println("⚠️ WiFi disconnected");
      wifiConnected = false;
      setAllLEDs(strip.Color(255, 0, 0));
      showStatusScreen();
    } else if (WiFi.status() == WL_CONNECTED && !wifiConnected) {
      Serial.println("✅ WiFi reconnected");
      wifiConnected = true;
      setAllLEDs(strip.Color(0, 255, 0));
      showStatusScreen();
    }
    lastWiFiCheck = millis();
  }
  
  delay(10);
}