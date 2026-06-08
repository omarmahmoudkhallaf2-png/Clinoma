import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ClinomaApp());
}

class ClinomaApp extends StatelessWidget {
  const ClinomaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Clinoma Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF6366F1),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      home: const MainWrapperPage(),
    );
  }
}

class MainWrapperPage extends StatefulWidget {
  const MainWrapperPage({super.key});

  @override
  State<MainWrapperPage> createState() => _MainWrapperPageState();
}

class _MainWrapperPageState extends State<MainWrapperPage> {
  // Configs
  final String targetUrl = "https://clinomabank-44.pages.dev/";
  final int cacheLimit = 500;
  
  InAppWebViewController? webViewController;
  bool isOffline = false;
  bool isLoading = true;
  double loadingProgress = 0.0;
  StreamSubscription<ConnectivityResult>? connectivitySubscription;
  
  // Cache directories
  late Directory cacheDir;
  List<String> cachedUrlsOrder = [];
  Map<String, String> cachedContentTypes = {};

  @override
  void initState() {
    super.initState();
    _initStorage();
    _setupConnectivity();
  }

  @override
  void dispose() {
    connectivitySubscription?.cancel();
    super.dispose();
  }

  Future<void> _initStorage() async {
    final appDir = await getApplicationDocumentsDirectory();
    cacheDir = Directory('${appDir.path}/web_cache');
    if (!await cacheDir.exists()) {
      await cacheDir.create(recursive: true);
    }
    
    // Load existing cache index
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      cachedUrlsOrder = prefs.getStringList('cached_urls_order') ?? [];
      final contentTypesJson = prefs.getString('cached_content_types') ?? '{}';
      cachedContentTypes = Map<String, String>.from(json.decode(contentTypesJson));
    });
  }

  void _setupConnectivity() {
    connectivitySubscription = Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      setState(() {
        isOffline = (result == ConnectivityResult.none);
      });
      if (!isOffline && webViewController != null) {
        webViewController?.reload();
      }
    });
  }

  // Save resource to disk
  Future<void> _cacheResource(String url, Uint8List bytes, String? contentType) async {
    if (cachedUrlsOrder.contains(url)) {
      // Move to end (LRU)
      cachedUrlsOrder.remove(url);
    }
    
    // Enforce cache limit
    if (cachedUrlsOrder.length >= cacheLimit) {
      final oldestUrl = cachedUrlsOrder.first;
      final oldestFile = File('${cacheDir.path}/${base64Url.encode(utf8.encode(oldestUrl))}');
      if (await oldestFile.exists()) {
        await oldestFile.delete();
      }
      cachedUrlsOrder.removeAt(0);
      cachedContentTypes.remove(oldestUrl);
    }

    // Write file
    final fileName = base64Url.encode(utf8.encode(url));
    final file = File('${cacheDir.path}/$fileName');
    await file.writeAsBytes(bytes);
    
    cachedUrlsOrder.add(url);
    if (contentType != null) {
      cachedContentTypes[url] = contentType;
    }

    // Save index
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('cached_urls_order', cachedUrlsOrder);
    await prefs.setString('cached_content_types', json.encode(cachedContentTypes));
  }

  // Read resource from disk
  Future<WebResourceResponse?> _getCachedResource(String url) async {
    if (!cachedUrlsOrder.contains(url)) return null;

    final fileName = base64Url.encode(utf8.encode(url));
    final file = File('${cacheDir.path}/$fileName');
    
    if (await file.exists()) {
      final bytes = await file.readAsBytes();
      final contentType = cachedContentTypes[url] ?? 'text/html';
      return WebResourceResponse(
        contentType: contentType.split(';').first,
        contentEncoding: 'utf-8',
        data: bytes,
      );
    }
    return null;
  }

  // Intercept and handle online/offline requests
  Future<WebResourceResponse?> _handleRequest(WebUri url) async {
    final urlString = url.toString();
    
    // Skip local assets and hot reloads
    if (!urlString.startsWith('http')) return null;

    // Check offline state
    if (isOffline) {
      final cached = await _getCachedResource(urlString);
      if (cached != null) {
        return cached;
      }
      
      // Block non-cached page access
      return WebResourceResponse(
        contentType: 'text/html',
        contentEncoding: 'utf-8',
        statusCode: 404,
        reasonPhrase: 'Offline Content Unavailable',
        data: Uint8List.fromList(utf8.encode(
          '<html><body style="background:#0F172A;color:#94A3B8;text-align:center;padding-top:50px;font-family:sans-serif;">'
          '<h2>هذا المحتوى غير متوفر أوفلاين</h2>'
          '<p>يرجى تصفح هذا الجزء أثناء الاتصال بالإنترنت ليتم حفظه تلقائياً.</p>'
          '</body></html>'
        )),
      );
    }

    // Online: Fetch and cache dynamically in background
    try {
      final cachedResponse = await _getCachedResource(urlString);
      if (cachedResponse != null) {
        // Return fast, check updates in background
        _fetchAndCacheInBackground(urlString);
        return cachedResponse;
      }

      // Fresh download
      final response = await http.get(Uri.parse(urlString));
      if (response.statusCode == 200) {
        final contentType = response.headers['content-type'];
        await _cacheResource(urlString, response.bodyBytes, contentType);
        return WebResourceResponse(
          contentType: contentType?.split(';').first ?? 'text/html',
          contentEncoding: 'utf-8',
          data: response.bodyBytes,
        );
      }
    } catch (_) {
      // Fallback to cache if network fails
      return await _getCachedResource(urlString);
    }

    return null;
  }

  void _fetchAndCacheInBackground(String url) async {
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final contentType = response.headers['content-type'];
        await _cacheResource(url, response.bodyBytes, contentType);
      }
    } catch (_) {}
  }

  // Grace period and auth state verification
  Future<void> _checkSubscriptionGracePeriod() async {
    final prefs = await SharedPreferences.getInstance();
    final lastVerifiedStr = prefs.getString('last_verified_subscription');
    
    if (lastVerifiedStr != null) {
      final lastVerified = DateTime.parse(lastVerifiedStr);
      final difference = DateTime.now().difference(lastVerified);
      
      if (difference.inHours > 48) {
        // Enforce online verification
        if (isOffline) {
          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (context) => AlertDialog(
              title: const Text('انتهت فترة السماح أوفلاين', textAlign: TextAlign.right),
              content: const Text(
                'يرجى الاتصال بالإنترنت مرة واحدة على الأقل للتحقق من حالة اشتراكك وتنشيط التطبيق.',
                textAlign: TextAlign.right,
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    webViewController?.loadUrl(urlRequest: URLRequest(url: WebUri(targetUrl)));
                  },
                  child: const Text('حاول مجدداً'),
                )
              ],
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Offline/Online Indicator Banner
            if (isOffline)
              Container(
                width: double.infinity,
                color: Colors.redAccent,
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.wifi_off, size: 16, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'أنت تصفح الآن في وضع عدم الاتصال (أوفلاين) - يعرض المحتوى المحفوظ فقط',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),

            // Loading Progress Bar
            if (isLoading)
              LinearProgressIndicator(
                value: loadingProgress,
                backgroundColor: const Color(0xFF1E293B),
                color: const Color(0xFF6366F1),
                minHeight: 3,
              ),

            // Main Webview
            Expanded(
              child: Stack(
                children: [
                  InAppWebView(
                    initialUrlRequest: URLRequest(url: WebUri(targetUrl)),
                    initialSettings: InAppWebViewSettings(
                      useShouldInterceptRequest: true,
                      allowFileAccessFromFileURLs: true,
                      allowUniversalAccessFromFileURLs: true,
                      cacheMode: CacheMode.LOAD_DEFAULT,
                      domStorageEnabled: true,
                      databaseEnabled: true,
                    ),
                    onWebViewCreated: (controller) {
                      webViewController = controller;
                    },
                    shouldInterceptRequest: (controller, request) async {
                      return await _handleRequest(request.url);
                    },
                    onLoadStart: (controller, url) {
                      setState(() {
                        isLoading = true;
                      });
                      _checkSubscriptionGracePeriod();
                    },
                    onLoadStop: (controller, url) async {
                      setState(() {
                        isLoading = false;
                      });
                      
                      // Intercept subscription status state changes if any (JavaScript Injection helper)
                      if (!isOffline) {
                        final prefs = await SharedPreferences.getInstance();
                        await prefs.setString('last_verified_subscription', DateTime.now().toIso8601String());
                      }
                    },
                    onProgressChanged: (controller, progress) {
                      setState(() {
                        loadingProgress = progress / 100;
                        if (progress == 100) {
                          isLoading = false;
                        }
                      });
                    },
                  ),
                ],
              ),
            ),
            
            // Native Helper Utility bar (Update checker / Status)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: const Color(0xFF1E293B),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  Text(
                    'الذاكرة المؤقتة: ${cachedUrlsOrder.length} عناصر',
                    style: const TextStyle(fontSize: 12, color: Colors.slate400),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    ),
                    onPressed: isOffline
                        ? null
                        : () async {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('جاري فحص وتحديث المحتوى المخزن...')),
                            );
                            // Refresh and verify cache
                            webViewController?.reload();
                          },
                    icon: const Icon(Icons.sync, size: 14, color: Colors.white),
                    label: const Text('تحديث المحتوى', style: TextStyle(fontSize: 12, color: Colors.white)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
