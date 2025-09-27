import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/qr/qr_scanner_screen.dart';
import 'screens/product/product_details_screen.dart';
import 'screens/farmer/farmer_dashboard_screen.dart';
import 'screens/consumer/consumer_dashboard_screen.dart';
import 'utils/theme.dart';

void main() {
  runApp(const AgriSupplyChainApp());
}

class AgriSupplyChainApp extends StatelessWidget {
  const AgriSupplyChainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
      ],
      child: ScreenUtilInit(
        designSize: const Size(375, 812),
        minTextAdapt: true,
        splitScreenMode: true,
        builder: (context, child) {
          return MaterialApp(
            title: 'Agri Supply Chain',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: const SplashScreen(),
            routes: {
              '/home': (context) => const HomeScreen(),
              '/login': (context) => const LoginScreen(),
              '/qr-scanner': (context) => const QRScannerScreen(),
              '/farmer-dashboard': (context) => const FarmerDashboardScreen(),
              '/consumer-dashboard': (context) => const ConsumerDashboardScreen(),
            },
            onGenerateRoute: (settings) {
              switch (settings.name) {
                case '/product-details':
                  final productId = settings.arguments as String;
                  return MaterialPageRoute(
                    builder: (context) => ProductDetailsScreen(productId: productId),
                  );
                default:
                  return null;
              }
            },
          );
        },
      ),
    );
  }
}