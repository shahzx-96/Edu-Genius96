import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase Authentication, Firestore and Storage
  // await Firebase.initializeApp();
  
  // Initialize Local Hive caching
  await Hive.initFlutter();
  await Hive.openBox('offline_cache');
  await Hive.openBox('user_settings');

  runApp(const EduGeniusApp());
}

class EduGeniusApp extends StatefulWidget {
  const EduGeniusApp({super.key});

  @override
  State<EduGeniusApp> createState() => _EduGeniusAppState();
}

class _EduGeniusAppState extends State<EduGeniusApp> {
  ThemeMode _themeMode = ThemeMode.system;

  void setThemeMode(ThemeMode mode) {
    setState(() {
      _themeMode = mode;
    });
  }

  @override
  Widget build(BuildContext context) {
    // EduGenius Theme: Blue, White, and Purple
    final lightTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF6366F1), // Indigo / Purple
        primary: const Color(0xFF4F46E5),
        secondary: const Color(0xFF2563EB), // Blue
        tertiary: const Color(0xFF9333EA),  // Purple
        surface: Colors.white,
        background: const Color(0xFFF8FAFC),
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
    );

    final darkTheme = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF818CF8),
        brightness: Brightness.dark,
        primary: const Color(0xFF6366F1),
        secondary: const Color(0xFF3B82F6),
        tertiary: const Color(0xFFA855F7),
        surface: const Color(0xFF0F172A),
        background: const Color(0xFF020617),
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(ThemeData.dark().textTheme),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF1E293B)),
        ),
      ),
    );

    return MaterialApp(
      title: 'EduGenius AI',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: _themeMode,
      home: const SplashScreen(),
    );
  }
}

/// 2-second Splash Screen with EduGenius AI branding
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2000), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const MainNavigationScreen(),
            transitionDuration: const Duration(milliseconds: 280),
            transitionsBuilder: (_, animation, __, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1D4ED8), Color(0xFF4338CA), Color(0xFF6B21A8)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: const Icon(Icons.school, size: 52, color: Colors.white),
              ),
              const SizedBox(height: 24),
              const Text(
                'EduGenius AI',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your Personal AI Teacher in Your Pocket.',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Bottom Navigation Host with 5 Tabs
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    Center(child: Text('Home Screen Dashboard')),
    Center(child: Text('Ask AI Chatbot Screen')),
    Center(child: Text('Tools Hub Screen')),
    Center(child: Text('Saved Academic Content Screen')),
    Center(child: Text('Settings & Profile Screen')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            selectedIcon: Icon(Icons.chat_bubble),
            label: 'Ask AI',
          ),
          NavigationDestination(
            icon: Icon(Icons.auto_awesome_outlined),
            selectedIcon: Icon(Icons.auto_awesome),
            label: 'Tools',
          ),
          NavigationDestination(
            icon: Icon(Icons.bookmark_outline),
            selectedIcon: Icon(Icons.bookmark),
            label: 'Saved',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
