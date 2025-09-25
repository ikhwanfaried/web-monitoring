<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\LoginLog;
use App\Models\Transaksi1;
use App\Models\User;
use App\Models\Dataset40200;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Cek apakah ada parameter user_role untuk redirect otomatis
        $userRole = $request->get('user_role');
        
        if ($userRole) {
            switch ($userRole) {
                case '1':
                    return redirect()->route('superadmin.dashboard');
                case '2':
                    return redirect()->route('admin.dashboard');
                case '3':
                    return redirect()->route('user.dashboard');
                default:
                    return view('app'); // Default login page
            }
        }
        
        // Jika tidak ada parameter, tampilkan halaman login default
        return view('app');
    }

    public function apiData(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $siteFilter = $request->get('site_filter');
            $userSite = $request->get('user_site', 'PJKA'); // Default site untuk user

            if ($userRole === 'user') {
                // User hanya melihat data dari site tertentu - gunakan dataset2 untuk konsistensi
                $dataset2Count = DB::table('dataset2')
                    ->where('Lanud/Depo', 'LIKE', '%' . $userSite . '%')
                    ->count();
                
                $data = [
                    'items' => $dataset2Count, // Gunakan dataset2 count untuk konsistensi dengan gudang
                    'dataset2' => $dataset2Count,
                    'gudang' => DB::table('gudang')
                        ->where('Site', $userSite)
                        ->count(),
                    'site' => 1, // User hanya melihat satu site
                ];
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Admin melihat data dari site mereka - gunakan dataset2 untuk konsistensi
                $dataset2Count = DB::table('dataset2')
                    ->join('site', 'dataset2.id_satuan', '=', 'site.id')
                    ->where('site.id', $siteFilter)
                    ->count();
                
                $data = [
                    'items' => $dataset2Count, // Gunakan dataset2 count untuk konsistensi
                    'dataset2' => $dataset2Count,
                    'gudang' => DB::table('gudang')
                        ->join('site', 'gudang.id_satuan', '=', 'site.id')
                        ->where('site.id', $siteFilter)
                        ->count(),
                    'site' => 1,
                ];
            } else {
                // SuperAdmin melihat semua data - gunakan dataset2 untuk konsistensi
                $dataset2Count = DB::table('dataset2')->count();
                $data = [
                    'items' => $dataset2Count, // Gunakan dataset2 count untuk konsistensi
                    'dataset2' => $dataset2Count,
                    'gudang' => DB::table('gudang')->count(),
                    'site' => DB::table('site')->count(),
                ];
            }

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
        
        if ($user && Hash::check($password, $user->password)) {
            // Get site information based on user's id_satuan
            $site = DB::table('site')->where('id', $user->id_satuan)->first();
            $siteName = $site ? trim(str_replace("\u{00A0}", ' ', $site->Site)) : null;
            
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
                    'id_status' => $user->id_status, // Tambahkan id_status untuk routing
                    'site' => $siteName, // Add site name for filtering
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
            $userRole = $request->get('user_role', 'superadmin');
            $userSite = $request->get('user_site', 'PJKA');
            $siteFilter = $request->get('site_filter');
            
            $query = DB::table('dataset2')
                ->select(
                    'dataset2.id',
                    'dataset2.Item ID as item_id',
                    'dataset2.Part Number as part_number',
                    'dataset2.Nama Barang as nama_barang',
                    'dataset2.Jumlah as jumlah',
                    'dataset2.Gudang as gudang',
                    'dataset2.Rak as rak',
                    'dataset2.Satuan as satuan'
                );

            // Apply site filtering based on user role
            if ($userRole === 'user' && $userSite) {
                // Dataset2 menggunakan kolom 'Lanud/Depo' untuk site filtering
                $query->where('dataset2.Lanud/Depo', 'LIKE', '%' . $userSite . '%');
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Get site name from site table for admin filtering
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $query->where('dataset2.Lanud/Depo', 'LIKE', '%' . $site->Site . '%');
                }
            }
            
            // Terapkan filter gudang jika bukan 'all'
            if ($filter && $filter !== 'all') {
                $query->where('dataset2.Gudang', $filter);
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
            
            // Apply same site filtering for count
            if ($userRole === 'user' && $userSite) {
                $totalQuery->where('dataset2.Lanud/Depo', 'LIKE', '%' . $userSite . '%');
            } elseif ($userRole === 'admin' && $siteFilter) {
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $totalQuery->where('dataset2.Lanud/Depo', 'LIKE', '%' . $site->Site . '%');
                }
            }
            
            if ($filter && $filter !== 'all') {
                $totalQuery->where('dataset2.Gudang', $filter);
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

    public function getSiteById($id)
    {
        try {
            $site = DB::table('site')->where('id', $id)->first();
            
            if (!$site) {
                return response()->json([
                    'error' => 'Site not found'
                ], 404);
            }

            return response()->json([
                'data' => $site
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

    public function getTransactionStatusChart(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $userSite = $request->get('user_site', 'PJKA');
            $siteFilter = $request->get('site_filter');

            $query = Transaksi1::select('status_transaksi', DB::raw('count(*) as count'))
                ->whereNotNull('status_transaksi')
                ->where('status_transaksi', '!=', '');

            // Apply site filtering based on user role
            if ($userRole === 'user') {
                // Untuk user, filter berdasarkan site langsung
                $query->where('site', $userSite);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Untuk admin, filter berdasarkan site ID
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $query->where('site', $site->Site);
                }
            }

            $statusData = $query->groupBy('status_transaksi')
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

    public function getGudangList(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $userSite = $request->get('user_site', 'PJKA');
            $siteFilter = $request->get('site_filter');

            if ($userRole === 'user') {
                // User hanya melihat gudang di site mereka
                $gudangList = DB::table('gudang')
                    ->select('Location as Gudang')
                    ->where('Site', $userSite)
                    ->orderBy('Location')
                    ->get();

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'gudang_table_filtered_by_site',
                    'site' => $userSite
                ]);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Admin hanya melihat gudang di site mereka (by site id from site table)
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $gudangList = DB::table('gudang')
                        ->select('Location as Gudang')
                        ->where('Site', $site->Site)
                        ->orderBy('Location')
                        ->get();
                } else {
                    $gudangList = collect([]);
                }

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'gudang_table_filtered_by_admin'
                ]);
            } else {
                // SuperAdmin melihat gudang yang ada di dataset2 (inventory data)
                $gudangList = DB::table('dataset2')
                    ->select('Gudang')
                    ->whereNotNull('Gudang')
                    ->where('Gudang', '!=', '')
                    ->where('Gudang', '!=', ' ')
                    ->groupBy('Gudang')
                    ->orderBy('Gudang')
                    ->get();

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'dataset2_table'
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error accessing gudang table: ' . $e->getMessage());
            
            return response()->json([
                'data' => [],
                'total_count' => 0,
                'source' => 'error',
                'error' => $e->getMessage()
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

    public function createUser(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255|unique:user',
                'password' => 'required|string|min:6',
                'Nama' => 'required|string|max:255',
                'NRP' => 'required|integer|unique:user,NRP',
                'Email' => 'required|email|max:255|unique:user,Email',
                'id_satuan' => 'required|integer',
                'id_status' => 'integer|min:1|max:3' // Optional, validate if provided
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            // Default id_status berdasarkan user yang membuat
            $id_status = $request->has('id_status') ? $request->id_status : 3; // Default ke User (3)

            $user = User::create([
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'Nama' => $request->Nama,
                'NRP' => $request->NRP,
                'Email' => $request->Email,
                'id_satuan' => $request->id_satuan,
                'id_status' => $id_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User berhasil ditambahkan',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'Nama' => $user->Nama,
                    'NRP' => $user->NRP,
                    'Email' => $user->Email,
                    'id_satuan' => $user->id_satuan,
                    'id_status' => $user->id_status
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error creating user',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTransaksi(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $filter = $request->get('filter', 'all');
            $siteFilter = $request->get('site_filter');
            $userRole = $request->get('user_role', 'admin');
            $userSite = $request->get('user_site');
            
            // Batasi per_page maksimum untuk performa server
            $maxPerPage = 100;
            if ($perPage > $maxPerPage) {
                $perPage = $maxPerPage;
            }
            
            // Create a subquery for items with MIN(id) to avoid correlated subquery in JOIN
            $itemsSubquery = DB::table('items')
                ->select('Part Number', DB::raw('MIN(id) as min_id'))
                ->groupBy('Part Number');

            $query = Dataset40200::select(
                'dataset40200.id',
                'dataset40200.nomor_dokumen',
                'transaksi1.bentuk',
                'dataset40200.part_number',
                DB::raw('COALESCE(items.`Nama Barang`, dataset2.`Nama Barang`) as nama_barang'),
                'dataset40200.dari_gudang',
                'dataset40200.ke_gudang',
                'dataset40200.dipasang_di_no_reg_sista',
                'dataset40200.status_permintaan',
                'dataset40200.status_penerimaan',
                'dataset40200.status_pengiriman',
                'dataset40200.site'
            )
            ->leftJoin('transaksi1', 'dataset40200.nomor_dokumen', '=', 'transaksi1.nomer_dokumen')
            ->leftJoinSub($itemsSubquery, 'items_min', function($join) {
                $join->on('dataset40200.part_number', '=', 'items_min.Part Number');
            })
            ->leftJoin('items', function($join) {
                $join->on('items_min.Part Number', '=', 'items.Part Number')
                     ->on('items_min.min_id', '=', 'items.id');
            })
            ->leftJoin('dataset2', 'dataset40200.part_number', '=', 'dataset2.Part Number');
            
            // Apply site filtering based on user role
            if ($userRole === 'user' && $userSite) {
                $query->where('dataset40200.site', $userSite);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Get site name from site table for admin filtering
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $query->where('dataset40200.site', $site->Site);
                }
            }
            
            // Terapkan filter jika bukan 'all'
            if ($filter && $filter !== 'all') {
                $query->where(function($q) use ($filter) {
                    $q->where('dari_gudang', 'LIKE', '%' . $filter . '%')
                      ->orWhere('ke_gudang', 'LIKE', '%' . $filter . '%');
                });
            }
            
            $items = $query
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
            
            // Hitung total dengan filter yang sama (tanpa JOIN untuk performance)
            $totalQuery = Dataset40200::query();
            
            // Apply same site filtering for count
            if ($userRole === 'user' && $userSite) {
                $totalQuery->where('site', $userSite);
            } elseif ($userRole === 'admin' && $siteFilter) {
                $site = DB::table('site')->where('id', $siteFilter)->first();
                if ($site) {
                    $totalQuery->where('site', $site->Site);
                }
            }
            
            if ($filter && $filter !== 'all') {
                $totalQuery->where(function($q) use ($filter) {
                    $q->where('dari_gudang', 'LIKE', '%' . $filter . '%')
                      ->orWhere('ke_gudang', 'LIKE', '%' . $filter . '%');
                });
            }
            $total = $totalQuery->count();
            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $items,
                'current_page' => (int) $page,
                'last_page' => $lastPage,
                'per_page' => (int) $perPage,
                'total' => $total,
                'filter' => $filter
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching transaction data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTransaksiGudangList()
    {
        try {
            // Gunakan raw SQL untuk menggabungkan dan mendeduplikasi gudang
            $gudangList = DB::select("
                SELECT DISTINCT gudang FROM (
                    SELECT dari_gudang as gudang FROM dataset40200 
                    WHERE dari_gudang IS NOT NULL AND dari_gudang != '' AND dari_gudang != ' '
                    UNION 
                    SELECT ke_gudang as gudang FROM dataset40200 
                    WHERE ke_gudang IS NOT NULL AND ke_gudang != '' AND ke_gudang != ' '
                ) as all_gudang 
                ORDER BY gudang
            ");

            // Convert to collection format
            $formattedGudang = collect($gudangList)->map(function($item) {
                return ['gudang' => $item->gudang];
            });

            return response()->json([
                'data' => $formattedGudang,
                'total_count' => $formattedGudang->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching transaction gudang list',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatusStatistics(Request $request)
    {
        try {
            $filter = $request->get('filter', 'all');
            $siteFilter = $request->get('site_filter');
            $userSite = $request->get('user_site'); // Direct site name from user
            $userRole = $request->get('user_role', 'superadmin');
            
            // Build base query
            $baseQuery = Dataset40200::query();
            
            // Apply site filtering for admin and user roles
            if ($userRole === 'admin' || $userRole === 'user') {
                if ($userSite) {
                    // Direct site filtering using user_site parameter
                    $baseQuery->where('site', $userSite);
                } elseif ($siteFilter) {
                    // Legacy: Get site name from id_satuan via join
                    $baseQuery->join('site', function($join) use ($siteFilter) {
                        $join->where('site.id', $siteFilter)
                             ->whereColumn('dataset40200.site', 'site.Site');
                    });
                }
            }
            
            // Apply filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('dari_gudang', 'LIKE', '%' . $filter . '%')
                      ->orWhere('ke_gudang', 'LIKE', '%' . $filter . '%');
                });
            }

            // Get statistics for each status type
            $statusPermintaan = (clone $baseQuery)
                ->select('status_permintaan', DB::raw('COUNT(*) as count'))
                ->whereNotNull('status_permintaan')
                ->where('status_permintaan', '!=', '')
                ->groupBy('status_permintaan')
                ->get();

            $statusPenerimaan = (clone $baseQuery)
                ->select('status_penerimaan', DB::raw('COUNT(*) as count'))
                ->whereNotNull('status_penerimaan')
                ->where('status_penerimaan', '!=', '')
                ->groupBy('status_penerimaan')
                ->get();

            $statusPengiriman = (clone $baseQuery)
                ->select('status_pengiriman', DB::raw('COUNT(*) as count'))
                ->whereNotNull('status_pengiriman')
                ->where('status_pengiriman', '!=', '')
                ->groupBy('status_pengiriman')
                ->get();

            return response()->json([
                'status_permintaan' => $statusPermintaan->map(function($item) {
                    return [
                        'label' => $item->status_permintaan,
                        'count' => $item->count
                    ];
                }),
                'status_penerimaan' => $statusPenerimaan->map(function($item) {
                    return [
                        'label' => $item->status_penerimaan,
                        'count' => $item->count
                    ];
                }),
                'status_pengiriman' => $statusPengiriman->map(function($item) {
                    return [
                        'label' => $item->status_pengiriman,
                        'count' => $item->count
                    ];
                }),
                'filter' => $filter
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching status statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatusDetail(Request $request)
    {
        try {
            $filter = $request->get('filter', 'all');
            $statusType = $request->get('status_type'); // 'status_permintaan', 'status_penerimaan', 'status_pengiriman'
            $statusValue = $request->get('status_value'); // e.g., 'sedang di proses'
            
            if (!$statusType || !$statusValue) {
                return response()->json([
                    'error' => 'Missing required parameters: status_type and status_value'
                ], 400);
            }

            // Build base query
            $baseQuery = Dataset40200::query();
            
            // Apply filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('dari_gudang', 'LIKE', '%' . $filter . '%')
                      ->orWhere('ke_gudang', 'LIKE', '%' . $filter . '%');
                });
            }

            // Filter by specific status
            $baseQuery->where($statusType, $statusValue);

            // Get breakdown by warehouse depending on status type
            $warehouseBreakdown = [];
            
            if ($statusType === 'status_permintaan') {
                // For permintaan, show from which gudang the requests are coming
                $warehouseBreakdown = $baseQuery
                    ->select('dari_gudang as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('dari_gudang')
                    ->where('dari_gudang', '!=', '')
                    ->where('dari_gudang', '!=', ' ')
                    ->groupBy('dari_gudang')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function($item) {
                        return [
                            'gudang' => trim($item->gudang),
                            'count' => $item->count,
                            'description' => 'permintaan dari gudang ini'
                        ];
                    });
            } elseif ($statusType === 'status_penerimaan') {
                // For penerimaan, show to which gudang items are being received
                $warehouseBreakdown = $baseQuery
                    ->select('ke_gudang as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('ke_gudang')
                    ->where('ke_gudang', '!=', '')
                    ->where('ke_gudang', '!=', ' ')
                    ->groupBy('ke_gudang')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function($item) {
                        return [
                            'gudang' => trim($item->gudang),
                            'count' => $item->count,
                            'description' => 'penerimaan ke gudang ini'
                        ];
                    });
            } elseif ($statusType === 'status_pengiriman') {
                // For pengiriman, show from which gudang items are being sent
                $warehouseBreakdown = $baseQuery
                    ->select('dari_gudang as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('dari_gudang')
                    ->where('dari_gudang', '!=', '')
                    ->where('dari_gudang', '!=', ' ')
                    ->groupBy('dari_gudang')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function($item) {
                        return [
                            'gudang' => trim($item->gudang),
                            'count' => $item->count,
                            'description' => 'pengiriman dari gudang ini'
                        ];
                    });
            }

            $totalCount = $warehouseBreakdown->sum('count');

            return response()->json([
                'success' => true,
                'data' => [
                    'status_type' => $statusType,
                    'status_value' => $statusValue,
                    'total_count' => $totalCount,
                    'warehouse_breakdown' => $warehouseBreakdown->values()->toArray(),
                    'filter' => $filter
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching status detail',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTopActiveWarehouses(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $filter = $request->get('filter', 'all');
            $siteFilter = $request->get('site_filter');
            $userSite = $request->get('user_site'); // Direct site name from user
            $userRole = $request->get('user_role', 'superadmin');
            
            // Build base query
            $baseQuery = Dataset40200::query();
            
            // Apply site filtering for admin and user roles
            if ($userRole === 'admin' || $userRole === 'user') {
                if ($userSite) {
                    // Direct site filtering using user_site parameter
                    $baseQuery->where('site', $userSite);
                } elseif ($siteFilter) {
                    // Legacy: Get site name from id_satuan via join
                    $baseQuery->join('site', function($join) use ($siteFilter) {
                        $join->where('site.id', $siteFilter)
                             ->whereColumn('dataset40200.site', 'site.Site');
                    });
                }
            }
            
            // Apply filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('dari_gudang', 'LIKE', '%' . $filter . '%')
                      ->orWhere('ke_gudang', 'LIKE', '%' . $filter . '%');
                });
            }

            // Get top active warehouses as "dari_gudang" (outgoing)
            $topFromWarehouses = (clone $baseQuery)
                ->select('dari_gudang as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('dari_gudang')
                ->where('dari_gudang', '!=', '')
                ->where('dari_gudang', '!=', ' ')
                ->groupBy('dari_gudang')
                ->orderBy('count', 'desc')
                ->limit($limit)
                ->get();

            // Get top active warehouses as "ke_gudang" (incoming)
            $topToWarehouses = (clone $baseQuery)
                ->select('ke_gudang as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('ke_gudang')
                ->where('ke_gudang', '!=', '')
                ->where('ke_gudang', '!=', ' ')
                ->groupBy('ke_gudang')
                ->orderBy('count', 'desc')
                ->limit($limit)
                ->get();

            // Combine and aggregate both directions
            $warehouseActivity = [];
            
            // Add outgoing transactions
            foreach ($topFromWarehouses as $warehouse) {
                $name = trim($warehouse->warehouse);
                if (!isset($warehouseActivity[$name])) {
                    $warehouseActivity[$name] = [
                        'warehouse' => $name,
                        'outgoing' => 0,
                        'incoming' => 0,
                        'total' => 0
                    ];
                }
                $warehouseActivity[$name]['outgoing'] = $warehouse->count;
                $warehouseActivity[$name]['total'] += $warehouse->count;
            }

            // Add incoming transactions
            foreach ($topToWarehouses as $warehouse) {
                $name = trim($warehouse->warehouse);
                if (!isset($warehouseActivity[$name])) {
                    $warehouseActivity[$name] = [
                        'warehouse' => $name,
                        'outgoing' => 0,
                        'incoming' => 0,
                        'total' => 0
                    ];
                }
                $warehouseActivity[$name]['incoming'] = $warehouse->count;
                $warehouseActivity[$name]['total'] += $warehouse->count;
            }

            // Sort by total activity and take top N
            $topWarehouses = collect($warehouseActivity)
                ->sortByDesc('total')
                ->take($limit)
                ->map(function ($warehouse) {
                    return [
                        'nama_gudang' => $warehouse['warehouse'],
                        'outgoing_count' => $warehouse['outgoing'],
                        'incoming_count' => $warehouse['incoming'],
                        'total_activity' => $warehouse['total']
                    ];
                })
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $topWarehouses,
                'limit' => $limit,
                'filter' => $filter,
                'total_warehouses' => count($warehouseActivity)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching top active warehouses',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getWarehouseStatistics(Request $request)
    {
        try {
            $siteFilter = $request->get('site_filter');
            $filter = $request->get('filter', 'all');
            $userRole = $request->get('user_role', 'superadmin');
            
            // Base query for transaksi with site filtering
            $baseQuery = Transaksi1::query();
            
            // Apply site filtering for admin and user roles
            if ($userRole === 'admin' || $userRole === 'user') {
                if ($siteFilter) {
                    $baseQuery->where('id_satuan', $siteFilter);
                }
            }
            
            // Apply gudang filter if specified
            if ($filter !== 'all') {
                $baseQuery->where(function ($query) use ($filter) {
                    $query->where('dari_gudang', $filter)
                          ->orWhere('ke_gudang', $filter);
                });
            }
            
            // Get warehouse activity statistics
            $fromWarehouseStats = (clone $baseQuery)
                ->select('dari_gudang as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('dari_gudang')
                ->where('dari_gudang', '!=', '')
                ->groupBy('dari_gudang')
                ->get();
                
            $toWarehouseStats = (clone $baseQuery)
                ->select('ke_gudang as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('ke_gudang')
                ->where('ke_gudang', '!=', '')
                ->groupBy('ke_gudang')
                ->get();
            
            // Combine and aggregate warehouse statistics
            $warehouseStats = [];
            
            foreach ($fromWarehouseStats as $stat) {
                $name = trim($stat->warehouse);
                if (!isset($warehouseStats[$name])) {
                    $warehouseStats[$name] = [
                        'warehouse' => $name,
                        'outgoing' => 0,
                        'incoming' => 0,
                        'total' => 0
                    ];
                }
                $warehouseStats[$name]['outgoing'] += $stat->count;
                $warehouseStats[$name]['total'] += $stat->count;
            }
            
            foreach ($toWarehouseStats as $stat) {
                $name = trim($stat->warehouse);
                if (!isset($warehouseStats[$name])) {
                    $warehouseStats[$name] = [
                        'warehouse' => $name,
                        'outgoing' => 0,
                        'incoming' => 0,
                        'total' => 0
                    ];
                }
                $warehouseStats[$name]['incoming'] += $stat->count;
                $warehouseStats[$name]['total'] += $stat->count;
            }
            
            // Sort by total activity
            $sortedStats = collect($warehouseStats)
                ->sortByDesc('total')
                ->map(function ($warehouse) {
                    return [
                        'nama_gudang' => $warehouse['warehouse'],
                        'outgoing_count' => $warehouse['outgoing'],
                        'incoming_count' => $warehouse['incoming'],
                        'total_activity' => $warehouse['total']
                    ];
                })
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $sortedStats,
                'filter' => $filter,
                'user_role' => $userRole,
                'site_filter' => $siteFilter,
                'total_warehouses' => count($warehouseStats)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching warehouse statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Role-based dashboard methods
    public function superAdminDashboard()
    {
        return view('superadmin');
    }

    public function adminDashboard()
    {
        return view('admin');
    }

    public function userDashboard()
    {
        return view('user');
    }
}
