import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const apiBase = String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:8080/api');
const storage = FlutterSecureStorage();

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Ads Revolution',
      theme: ThemeData(useMaterial3: true),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget { const LoginPage({super.key}); @override State<LoginPage> createState()=>_LoginPageState();}
class _LoginPageState extends State<LoginPage> {
  final emailCtrl = TextEditingController(text: "test@example.com");
  final passCtrl  = TextEditingController(text: "123");
  bool loading=false, error=false;

  Future<void> login() async {
    setState(()=>loading=true);
    final res = await http.post(Uri.parse('$apiBase/auth/login'),
      headers:{'Content-Type':'application/json'},
      body: jsonEncode({'email': emailCtrl.text, 'password': passCtrl.text})
    );
    setState(()=>loading=false);
    if(res.statusCode==200){
      final data=jsonDecode(res.body);
      await storage.write(key:'token', value:data['token']);
      if(!mounted) return;
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_)=>const Dashboard()));
    } else {
      setState(()=>error=true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text('AI Ads Revolution', style: TextStyle(fontSize:24, fontWeight: FontWeight.bold)),
              const SizedBox(height:16),
              TextField(controller: emailCtrl, decoration: const InputDecoration(labelText:'Email')),
              const SizedBox(height:8),
              TextField(controller: passCtrl, obscureText:true, decoration: const InputDecoration(labelText:'Password')),
              const SizedBox(height:16),
              FilledButton(onPressed: loading?null:login, child: Text(loading?'Accesso...':'Entra')),
              if(error) const Padding(
                padding: EdgeInsets.only(top:12),
                child: Text('Credenziali non valide', style: TextStyle(color: Colors.red)),
              )
            ]),
          ),
        ),
      ),
    );
  }
}

class Dashboard extends StatefulWidget { const Dashboard({super.key}); @override State<Dashboard> createState()=>_DashboardState();}
class _DashboardState extends State<Dashboard> {
  Map data = {};
  Map forecast = {};
  bool loading=true;

  Future<void> fetchMetrics() async {
    final m = await http.get(Uri.parse('$apiBase/metrics'));
    final f = await http.get(Uri.parse('$apiBase/forecast'));
    setState(() {
      data = (m.statusCode==200) ? jsonDecode(m.body) : {};
      forecast = (f.statusCode==200) ? jsonDecode(f.body) : {};
      loading = false;
    });
  }

  @override void initState(){ super.initState(); fetchMetrics(); }

  String n2(num? v, [int d=2]) => (v??0).toStringAsFixed(d);

  @override
  Widget build(BuildContext context) {
    final totals = data['totals'] ?? {};
    final kpis   = data['kpis'] ?? {};
    final fsum   = forecast['summary'] ?? {};
    final fser   = (forecast['series'] ?? []) as List;

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: loading
        ? const Center(child:CircularProgressIndicator())
        : Padding(
            padding: const EdgeInsets.all(16),
            child: ListView(
              children: [
                Wrap(spacing:12, runSpacing:12, children: [
                  _KpiTile(title:"Spesa", value:"€${n2(totals['spend'])}"),
                  _KpiTile(title:"Click", value:"${totals['clicks']??0}"),
                  _KpiTile(title:"Lead",  value:"${totals['leads']??0}"),
                  _KpiTile(title:"CTR",   value:"${n2(kpis['ctr'])}%"),
                  _KpiTile(title:"CPC",   value:"€${n2(kpis['cpc'],3)}"),
                  _KpiTile(title:"CPL",   value:"€${n2(kpis['cpl'])}"),
                  _KpiTile(title:"ROI",   value:"${n2(kpis['roi'],1)}%"),
                ]),
                const SizedBox(height:16),
                Card(child: Padding(padding: const EdgeInsets.all(16), child: Text("Andamento 7 giorni: ${((data['series']??[]) as List).length} punti"))),
                const SizedBox(height:16),
                Card(child: Padding(padding: const EdgeInsets.all(16), child: Text("Campagne: ${((data['breakdownByCampaign']??[]) as List).length} attive"))),
                const SizedBox(height:16),
                if (forecast.isNotEmpty)
                  Card(child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text("Previsioni 7 giorni (AI)", style: TextStyle(fontSize:16, fontWeight: FontWeight.w700)),
                      const SizedBox(height:8),
                      Text("CTR medio previsto: ${n2(fsum['avgCTR'])}%"),
                      Text("ROI medio previsto: ${n2(fsum['avgROI'])}%"),
                      Text("Spesa totale prevista: €${n2(fsum['totalSpend'])}"),
                      Text("Revenue totale prevista: €${n2(fsum['totalRevenue'])}"),
                      Text("Click totali previsti: ${fsum['totalClicks'] ?? 0}"),
                      const SizedBox(height:8),
                      Text("Giorni previsti: ${fser.length}"),
                    ]),
                  )),
              ],
            ),
          ),
    );
  }
}

class _KpiTile extends StatelessWidget{
  final String title, value;
  const _KpiTile({required this.title, required this.value});
  @override Widget build(BuildContext context){
    return SizedBox(
      width: 170,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
            Text(title, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height:6),
            Text(value, style: const TextStyle(fontSize:18, fontWeight: FontWeight.w700)),
          ]),
        ),
      ),
    );
  }
}
