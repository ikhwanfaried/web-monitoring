<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\LoginLog;
use App\Models\Transaksi1;

class DashboardController extends Controller
{
    public function index()
    {
        return view('app');
    }

    public function apiData()
    {
        try {
            $data = [
                'items' => DB::table('items')->count(),
                'dataset2' => DB::table('dataset2')->count(),
                'gudang' => DB::table('gudang')->count(),
                'site' => DB::table('site')->count(),
            ];

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getItems(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 15;
            
            $items = DB::table('items')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
                
            $total = DB::table('items')->count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $items,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');
        
        $user = DB::table('user')->where('username', $username)->first();
        
        if ($user && $user->password === $password) {
            // Login berhasil - catat log
            LoginLog::create([
                'user_id' => $user->id,
                'username' => $user->username,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_time' => now(),
                'status' => 'success'
            ]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->Nama,
                    'email' => $user->Email,
                    'nrp' => $user->NRP,
                    'id_satuan' => $user->id_satuan,
                ]
            ]);
        } else {
            // Login gagal - catat log
            LoginLog::create([
                'user_id' => $user ? $user->id : null,
                'username' => $username,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_time' => now(),
                'status' => 'failed'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Username atau password salah.'
            ], 401);
        }
    }

    public function getDataset2(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 15;
            
            $items = DB::table('dataset2')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
                
            $total = DB::table('dataset2')->count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $items,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching dataset2',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getGudang(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 25);
            $filter = $request->get('filter', 'all');
            
            $query = DB::table('dataset2')
                ->select(
                    'id',
                    'Item ID as item_id',
                    'Part Number as part_number',
                    'Nama Barang as nama_barang',
                    'Jumlah as jumlah',
                    'Gudang as gudang',
                    'Rak as rak',
                    'Satuan as satuan'
                );
            
            // Terapkan filter jika bukan 'all'
            if ($filter && $filter !== 'all') {
                $query->where('Gudang', $filter);
            }
            
            // Batasi per_page maksimum untuk performa server
            $maxPerPage = 100;
            if ($perPage > $maxPerPage) {
                $perPage = $maxPerPage;
            }
            
            $items = $query
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
            
            // Hitung total dengan filter yang sama
            $totalQuery = DB::table('dataset2');
            if ($filter && $filter !== 'all') {
                $totalQuery->where('Gudang', $filter);
            }
            $total = $totalQuery->count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $items,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total,
                'filter' => $filter
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching gudang',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getSite(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 15;
            
            $items = DB::table('site')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
                
            $total = DB::table('site')->count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $items,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching site',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getLoginLogs(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 15;
            
            $logs = LoginLog::with('user')
                ->orderBy('login_time', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
                
            $total = LoginLog::count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $logs,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching login logs',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getLoginStats()
    {
        try {
            $today = LoginLog::today()->count();
            $successful = LoginLog::successful()->count();
            $failed = LoginLog::failed()->count();
            $totalLogs = LoginLog::count();

            return response()->json([
                'today' => $today,
                'successful' => $successful,
                'failed' => $failed,
                'total' => $totalLogs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching login stats',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTransactionStatusChart()
    {
        try {
            $statusData = Transaksi1::select('status_transaksi', DB::raw('count(*) as count'))
                ->whereNotNull('status_transaksi')
                ->where('status_transaksi', '!=', '')
                ->groupBy('status_transaksi')
                ->orderBy('count', 'desc')
                ->get();

            $chartData = $statusData->map(function($item) {
                return [
                    'name' => $item->status_transaksi,
                    'value' => $item->count
                ];
            });

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching transaction status data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDailyLoginChart()
    {
        try {
            // Ambil data login untuk 30 hari terakhir
            $dailyLogins = LoginLog::select(
                    DB::raw('DATE(login_time) as date'),
                    DB::raw('COUNT(*) as total'),
                    DB::raw('SUM(CASE WHEN status = "success" THEN 1 ELSE 0 END) as successful'),
                    DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
                )
                ->where('login_time', '>=', now()->subDays(30))
                ->groupBy(DB::raw('DATE(login_time)'))
                ->orderBy('date', 'asc')
                ->get();

            // Format data untuk chart
            $chartData = $dailyLogins->map(function($item) {
                return [
                    'date' => $item->date,
                    'total' => $item->total,
                    'successful' => $item->successful,
                    'failed' => $item->failed
                ];
            });

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching daily login data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getGudangList()
    {
        try {
            // Ambil semua gudang dari tabel gudang (432 gudang)
            $gudangList = DB::table('gudang')
                ->select('Location as Gudang')
                ->orderBy('Location')
                ->get();

            // Debug: log jumlah gudang yang ditemukan
            \Log::info('Total gudang from gudang table: ' . $gudangList->count());
            
            return response()->json([
                'data' => $gudangList,
                'total_count' => $gudangList->count(),
                'source' => 'gudang_table'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error accessing gudang table, falling back to dataset2: ' . $e->getMessage());
            
            // Fallback ke dataset2 jika tabel gudang tidak accessible
            $gudangList = DB::table('dataset2')
                ->select('Gudang')
                ->distinct()
                ->whereNotNull('Gudang')
                ->where('Gudang', '!=', '')
                ->where('Gudang', '!=', ' ')
                ->orderBy('Gudang')
                ->get();

            return response()->json([
                'data' => $gudangList,
                'total_count' => $gudangList->count(),
                'source' => 'dataset2_fallback'
            ]);
        }
    }

    public function getStockChart(Request $request)
    {
        try {
            $filter = $request->get('filter', 'all');
            
            $query = DB::table('dataset2')
                ->select('Part Number as part_number', 'Nama Barang as nama_barang', 'jumlah', 'Gudang as gudang')
                ->whereNotNull('jumlah');
                
            // Terapkan filter jika bukan 'all'
            if ($filter && $filter !== 'all') {
                $query->where('Gudang', $filter);
            }
            
            $stockData = $query->get();
            
            // Kategorikan stock dengan detail items
            $stockHabis = [];
            $stockMenupis = [];
            $stockSiapPakai = [];
            
            foreach ($stockData as $item) {
                $jumlah = (int) $item->jumlah;
                
                $itemDetail = [
                    'part_number' => $item->part_number,
                    'nama_barang' => $item->nama_barang,
                    'jumlah' => $jumlah,
                    'gudang' => $item->gudang
                ];
                
                if ($jumlah == 0) {
                    $stockHabis[] = $itemDetail;
                } elseif ($jumlah > 0 && $jumlah <= 10) {
                    $stockMenupis[] = $itemDetail;
                } else {
                    $stockSiapPakai[] = $itemDetail;
                }
            }
            
            $chartData = [
                ['name' => 'Stock Habis', 'value' => count($stockHabis)],
                ['name' => 'Stock Menipis', 'value' => count($stockMenupis)],
                ['name' => 'Siap Pakai', 'value' => count($stockSiapPakai)]
            ];

            return response()->json([
                'chart_data' => $chartData,
                'detail_items' => [
                    'stock_habis' => array_slice($stockHabis, 0, 10), // Limit 10 items untuk performa
                    'stock_menipis' => array_slice($stockMenupis, 0, 10),
                    'siap_pakai' => array_slice($stockSiapPakai, 0, 10)
                ],
                'total_counts' => [
                    'stock_habis' => count($stockHabis),
                    'stock_menipis' => count($stockMenupis),
                    'siap_pakai' => count($stockSiapPakai)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching stock chart data',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
