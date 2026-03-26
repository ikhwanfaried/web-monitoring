<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
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
            $userLocId = $request->get('user_locid');

            if ($userRole === 'user' && $userLocId) {
                // User hanya melihat data dari location mereka (inventory.idlocation = user.locid)
                $itemCount = DB::table('inventory')
                    ->where('idlocation', $userLocId)
                    ->count();
                
                $data = [
                    'items' => $itemCount,
                    'dataset2' => $itemCount,
                    'gudang' => 1,
                    'site' => 1,
                ];
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Admin melihat data dari site mereka (siteFilter is site.siteid string like "LANUD ATS")
                $itemCount = DB::table('item')->count();
                
                $data = [
                    'items' => $itemCount,
                    'dataset2' => $itemCount, // Untuk backward compatibility
                    'gudang' => DB::table('location')
                        ->join('site', 'location.idsite', '=', 'site.id')
                        ->where('site.siteid', $siteFilter)
                        ->count(),
                    'site' => 1,
                ];
            } else {
                // SuperAdmin melihat semua data
                $itemCount = DB::table('item')->count();
                $data = [
                    'items' => $itemCount,
                    'dataset2' => $itemCount, // Untuk backward compatibility
                    'gudang' => DB::table('location')->count(),
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

        $userModel = User::where('username', $username)->first();

        if ($userModel && Hash::check($password, $userModel->password)) {
            // Perform Laravel session-based login so 'auth' middleware recognizes the user
            Auth::login($userModel);
            // regenerate session id for security
            $request->session()->regenerate();

            // Get site information based on user's siteid
            $site = DB::table('site')->where('id', $userModel->siteid)->first();
            $siteName = $site ? trim(str_replace("\u{00A0}", ' ', $site->siteid)) : null;

            // Get location information based on user's locid
            $location = DB::table('location')->where('id', $userModel->locid)->first();
            $locationName = $location ? $location->location : null;

            // Login berhasil - catat log
            LoginLog::create([
                'user_id' => $userModel->id,
                'username' => $userModel->username,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'login_time' => now(),
                'status' => 'success'
            ]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $userModel->id,
                    'username' => $userModel->username,
                    'name' => $userModel->Nama,
                    'email' => $userModel->Email,
                    'nrp' => $userModel->NRP,
                    'siteid' => $userModel->siteid,
                    'locid' => $userModel->locid,
                    'location' => $locationName,
                    'id_status' => $userModel->id_status,
                    'site' => $siteName,
                ]
            ]);
        } else {
            // Login gagal - catat log
            LoginLog::create([
                'user_id' => $userModel ? $userModel->id : null,
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

   

    public function getGudang(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 25);
            $filter = $request->get('filter', 'all');
            $filterItemId = $request->get('filter_itemid');
            $filterPartNumber = $request->get('filter_partnumber');
            $userRole = $request->get('user_role', 'superadmin');
            $userSite = $request->get('user_site', 'PJKA');
            $siteFilter = $request->get('site_filter');
            $userLocId = $request->get('user_locid'); // User's location ID
            
            // Query dengan inventory sebagai base table (source of truth)
            $query = DB::table('inventory')
                ->join('item', 'inventory.itemnum', '=', 'item.itemnum')
                ->join('location', 'inventory.idlocation', '=', 'location.id')
                ->join('site', 'location.idsite', '=', 'site.id')
                ->leftJoin('invbalance', function($join) {
                    $join->on('inventory.itemnum', '=', 'invbalance.itemnum')
                         ->on('location.location', '=', 'invbalance.location');
                })
                ->select(
                    'inventory.itemnum as item_id',
                    'item.pn as part_number',
                    'item.description as nama_barang',
                    DB::raw('COALESCE(invbalance.curbal, 0) as jumlah'),
                    'location.location as gudang',
                    'site.siteid as site',
                    'inventory.binnum as rak',
                    'item.issueunit as satuan'
                );

            // Apply location/site filtering based on user role
            if ($userRole === 'user' && $userLocId) {
                // Filter berdasarkan location ID user
                $query->where('inventory.idlocation', $userLocId);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Filter berdasarkan site admin (siteFilter is siteid string like "LANUD ATS")
                $query->where('location.idsite', function($q) use ($siteFilter) {
                    $q->select('id')
                      ->from('site')
                      ->where('siteid', $siteFilter)
                      ->limit(1);
                });
            }
            
            // Terapkan filter gudang jika bukan 'all'
            if ($filter && $filter !== 'all') {
                $query->where('location.location', $filter);
            }
            
            // Filter by Item ID
            if ($filterItemId) {
                $query->where('inventory.itemnum', 'LIKE', '%' . $filterItemId . '%');
            }
            
            // Filter by Part Number
            if ($filterPartNumber) {
                $query->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            // Filter by Nama Barang
            $filterNamaBarang = $request->get('filter_namabarang');
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $query->where('item.description', $filterNamaBarang);
            }
            
            // Filter by Site
            $filterSite = $request->get('filter_site');
            if ($filterSite && $filterSite !== 'all') {
                $query->where('site.siteid', $filterSite);
            }
            
            // Batasi per_page maksimum untuk performa server
            $maxPerPage = 100;
            if ($perPage > $maxPerPage) {
                $perPage = $maxPerPage;
            }
            
            // Debug: Log SQL query
            \Log::info('Gudang Table Query:', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'filter' => $filter,
                'siteFilter' => $siteFilter,
                'userRole' => $userRole
            ]);
            
            $items = $query
                ->orderBy('inventory.id', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
            
            // Hitung total dengan filter yang sama - HARUS JOIN item juga untuk konsistensi
            $totalQuery = DB::table('inventory')
                ->join('item', 'inventory.itemnum', '=', 'item.itemnum')
                ->join('location', 'inventory.idlocation', '=', 'location.id')
                ->join('site', 'location.idsite', '=', 'site.id'); // Join site untuk filter site
            
            // Apply same location/site filtering for count
            if ($userRole === 'user' && $userLocId) {
                $totalQuery->where('inventory.idlocation', $userLocId);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Filter berdasarkan site admin (siteFilter is siteid string like "LANUD ATS")
                $totalQuery->where('location.idsite', function($q) use ($siteFilter) {
                    $q->select('id')
                      ->from('site')
                      ->where('siteid', $siteFilter)
                      ->limit(1);
                });
            }
            
            if ($filter && $filter !== 'all') {
                $totalQuery->where('location.location', $filter);
            }
            
            // Apply same item filters for count
            if ($filterItemId) {
                $totalQuery->where('inventory.itemnum', 'LIKE', '%' . $filterItemId . '%');
            }
            
            if ($filterPartNumber) {
                $totalQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            // Apply nama barang filter for count
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $totalQuery->where('item.description', $filterNamaBarang);
            }
            
            // Apply site filter for count
            if ($filterSite && $filterSite !== 'all') {
                $totalQuery->where('site.siteid', $filterSite);
            }
            
            $total = $totalQuery->count();
            $lastPage = ceil($total / $perPage);
            
            // Debug: Log total count
            \Log::info('Gudang Table Total:', [
                'total' => $total,
                'perPage' => $perPage,
                'lastPage' => $lastPage,
                'currentPage' => $page,
                'itemsReturned' => count($items)
            ]);

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

    public function getStatus(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            
            $query = DB::table('status')
                ->select('id', 'status as name');
                
            $total = $query->count();
            $data = $query->skip(($page - 1) * $perPage)
                         ->take($perPage)
                         ->get();
            
            return response()->json([
                'data' => $data,
                'current_page' => (int) $page,
                'last_page' => ceil($total / $perPage),
                'per_page' => (int) $perPage,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getLoginLogs(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 15;
            $siteid = $request->get('siteid'); // Get siteid filter
            
            $query = LoginLog::with('user')
                ->orderBy('login_time', 'desc');
            
            // Apply site filter if provided
            if ($siteid) {
                $query->whereHas('user', function($q) use ($siteid) {
                    $q->where('siteid', $siteid);
                });
            }
                
            $logs = $query->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
                
            $total = $query->count();
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

    public function getLoginStats(Request $request)
    {
        try {
            $siteid = $request->get('siteid'); // Get siteid filter
            
            // Build base query with site filter
            $baseQuery = LoginLog::query();
            if ($siteid) {
                $baseQuery->whereHas('user', function($q) use ($siteid) {
                    $q->where('siteid', $siteid);
                });
            }
            
            // Clone query for different stats
            $today = (clone $baseQuery)->today()->count();
            $successful = (clone $baseQuery)->successful()->count();
            $failed = (clone $baseQuery)->failed()->count();
            $totalLogs = (clone $baseQuery)->count();

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
            $userLocId = $request->get('user_locid'); // Get location ID for user
            $siteFilter = $request->get('site_filter');
            $siteid = $request->get('siteid'); // Get siteid (site.id numeric)

            // Query dari tabel invuse, menggunakan field status untuk chart
            $query = DB::table('invuse')
                ->select('invuse.status', DB::raw('count(*) as count'))
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->whereNotNull('invuse.status')
                ->where('invuse.status', '!=', '');

            // Apply filtering based on user role
            if ($userRole === 'user' && $userLocId) {
                // Untuk user, filter berdasarkan location ID (tostoreloc OR fromstoreloc)
                $query->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            } elseif ($siteid) {
                // Filter by siteid (numeric site.id)
                $query->where('invuse.idsite', $siteid);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Untuk admin, filter berdasarkan site ID
                $query->where('invuse.idsite', $siteFilter);
            }

            $statusData = $query->groupBy('invuse.status')
                ->orderBy('count', 'desc')
                ->get();

            $chartData = $statusData->map(function($item) {
                return [
                    'name' => $item->status,
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
            $siteFilter = request()->get('site_filter');

            $baseQuery = LoginLog::select(
                    DB::raw('DATE(login_time) as date'),
                    DB::raw('COUNT(*) as total'),
                    DB::raw('SUM(CASE WHEN status = "success" THEN 1 ELSE 0 END) as successful'),
                    DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
                )
                ->where('login_time', '>=', now()->subDays(30));

            // Jika ada site_filter (site.siteid string), gabungkan dengan tabel user -> site untuk memfilter berdasarkan site user
            if (!empty($siteFilter)) {
                // login_logs.user_id -> user.id, user.siteid -> site.id, site.siteid is site identifier string
                $baseQuery = $baseQuery
                    ->join('user', 'login_logs.user_id', '=', 'user.id')
                    ->join('site', 'user.siteid', '=', 'site.id')
                    ->where('site.siteid', $siteFilter);
            }

            $dailyLogins = $baseQuery
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
                $gudangList = DB::table('location')
                    ->join('site', 'location.idsite', '=', 'site.id')
                    ->select('location.location as Gudang')
                    ->where('site.siteid', $userSite)
                    ->orderBy('location.location')
                    ->get();

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'location_table_filtered_by_site',
                    'site' => $userSite
                ]);
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Admin hanya melihat gudang di site mereka (by site id from site table)
                $gudangList = DB::table('location')
                    ->select('location.id as id', 'location.location as Gudang')
                    ->where('location.idsite', $siteFilter)
                    ->orderBy('location.location')
                    ->get();

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'location_table_filtered_by_admin'
                ]);
            } else {
                // SuperAdmin melihat semua gudang dari location table
                $gudangList = DB::table('location')
                    ->select('location as Gudang')
                    ->whereNotNull('location')
                    ->where('location', '!=', '')
                    ->orderBy('location')
                    ->get();

                return response()->json([
                    'data' => $gudangList,
                    'total_count' => $gudangList->count(),
                    'source' => 'location_table'
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
            $siteFilter = $request->get('site');
            $userLocId = $request->get('user_locid');
            $userRole = $request->get('user_role');
            
            // Base query - sama dengan api_stock_chart.php
            $query = DB::table('inventory')
                ->select(
                    'inventory.itemnum',
                    'item.pn as part_number',
                    'item.description as nama_barang',
                    DB::raw('COALESCE(MAX(invbalance.curbal), 0) as jumlah'),
                    'location.location as gudang',
                    'inventory.binnum as rak',
                    'item.issueunit as satuan'
                )
                ->join('item', 'inventory.itemnum', '=', 'item.itemnum')
                ->join('location', 'inventory.idlocation', '=', 'location.id')
                ->leftJoin('invbalance', function($join) {
                    $join->on('inventory.itemnum', '=', 'invbalance.itemnum')
                         ->on('location.location', '=', 'invbalance.location');
                });
            
            // Apply USER location filter (highest priority)
            if ($userRole === 'user' && $userLocId) {
                $query->where('inventory.idlocation', $userLocId);
            }
            // Apply site filter for Admin/SuperAdmin
            elseif ($siteFilter) {
                $query->whereRaw('location.idsite = (SELECT id FROM site WHERE siteid = ? LIMIT 1)', [$siteFilter]);
            }
            
            // Apply gudang filter if not 'all'
            if ($filter && $filter !== 'all') {
                $query->where('location.location', $filter);
            }
            
            $stockData = $query->groupBy('inventory.id')
                ->orderBy('item.pn')
                ->get();
            
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
                'siteid' => 'required|integer',
                'locid' => 'nullable|integer', // Location ID is optional
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
                'siteid' => $request->siteid,
                'locid' => $request->locid, // Location ID for user's warehouse
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
                    'siteid' => $user->siteid,
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
            $filter = $request->get('filter', 'all'); // Legacy support
            $filterFrom = $request->get('filter_from', 'all'); // New: filter untuk fromstoreloc
            $filterTo = $request->get('filter_to', 'all'); // New: filter untuk tostoreloc
            $filterNoDok = $request->get('filter_nodok'); // Filter nomor dokumen
            $filterPartNumber = $request->get('filter_partnumber'); // Filter part number
            $filterNoReg = $request->get('filter_noreg'); // Filter no. reg
            $siteFilter = $request->get('site_filter');
            $userRole = $request->get('user_role', 'admin');
            $userSite = $request->get('user_site');
            $userLocId = $request->get('user_locid'); // User's location ID
            $filterType = $request->get('filter_type'); // fromstoreloc atau tostoreloc
            $filterLocId = $request->get('filter_locid'); // location ID untuk filter
            
            // Batasi per_page maksimum untuk performa server
            $maxPerPage = 100;
            if ($perPage > $maxPerPage) {
                $perPage = $maxPerPage;
            }
            
            // Query using new table structure: invuse + invuseline + item + location + site
            $query = DB::table('invuse')
                ->select(
                    'invuse.invusenum',
                    'invuse.nomerdokumen as no_dok',
                    'item.pn as part_no',
                    'item.description as nama_barang',
                    'invuse.no_reg_sista as reg',
                    'loc_from.location as dari_gudang',
                    'loc_to.location as ke_gudang',
                    'invuse.statpermintaan as status_permintaan',
                    'invuse.receipts as status_penerimaan',
                    'invuse.status as status_pengiriman',
                    'site.siteid as site',
                    'invuseline.requestqty as diminta',
                    'invuseline.quantity as dikirim'
                )
                ->leftJoin('invuseline', 'invuse.invusenum', '=', 'invuseline.invusenum')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum')
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id');
            
            // Apply special filter for status update modal
            if ($filterType && $filterLocId) {
                if ($filterType === 'fromstoreloc') {
                    $query->where('invuse.fromstoreloc', $filterLocId);
                } elseif ($filterType === 'tostoreloc') {
                    // Filter untuk status penerimaan
                    $query->where('invuse.tostoreloc', $filterLocId);
                    // Hanya tampilkan yang status permintaan = DIPROSES dan status pengiriman != CANCELLED
                    $query->where('invuse.statpermintaan', 'DIPROSES')
                          ->where('invuse.status', '!=', 'CANCELLED');
                }
            }
            // Apply location filtering based on user role
            elseif ($userRole === 'user' && $userLocId) {
                // User filter by location ID (tostoreloc OR fromstoreloc = user.locid)
                $query->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            } elseif ($userRole === 'admin' && $siteFilter) {
                // Admin filter by site.siteid (string like "DEPO 10")
                $query->where('site.siteid', $siteFilter);
            }
            
            // Terapkan filter jika bukan 'all' - filter by location name
            // Legacy single filter support (filters both from and to)
            if ($filter && $filter !== 'all') {
                $query->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }
            
            // New: Separate filters for fromstoreloc and tostoreloc
            if ($filterFrom && $filterFrom !== 'all') {
                $query->where('loc_from.location', 'LIKE', '%' . $filterFrom . '%');
            }
            
            if ($filterTo && $filterTo !== 'all') {
                $query->where('loc_to.location', 'LIKE', '%' . $filterTo . '%');
            }
            
            // Filter by Nomor Dokumen
            if ($filterNoDok) {
                $query->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }
            
            // Filter by Part Number
            if ($filterPartNumber) {
                $query->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            // Filter by No. Reg
            if ($filterNoReg) {
                $query->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            // Filter by Nama Barang
            $filterNamaBarang = $request->get('filter_namabarang');
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $query->where('item.description', $filterNamaBarang);
            }
            
            // Filter by Site
            $filterSite = $request->get('filter_site');
            if ($filterSite && $filterSite !== 'all') {
                $query->where('site.siteid', $filterSite);
            }
            
            $items = $query
                ->orderBy('invuse.invusenum', 'desc')
                ->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();
            
            // Hitung total dengan filter yang sama - HARUS JOIN item untuk filter part number dan nama barang
            $totalQuery = DB::table('invuse')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum') // JOIN item untuk filter part number dan nama barang
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id');
            
            // Apply special filter for status update modal
            if ($filterType && $filterLocId) {
                if ($filterType === 'fromstoreloc') {
                    $totalQuery->where('invuse.fromstoreloc', $filterLocId);
                } elseif ($filterType === 'tostoreloc') {
                    // Filter untuk status penerimaan
                    $totalQuery->where('invuse.tostoreloc', $filterLocId);
                    // Hanya tampilkan yang status permintaan = DIPROSES dan status pengiriman != CANCELLED
                    $totalQuery->where('invuse.statpermintaan', 'DIPROSES')
                               ->where('invuse.status', '!=', 'CANCELLED');
                }
            }
            // Apply same location filtering for count
            elseif ($userRole === 'user' && $userLocId) {
                $totalQuery->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            } elseif ($userRole === 'admin' && $siteFilter) {
                $totalQuery->where('site.siteid', $siteFilter);
            }
            
            // Legacy single filter support (filters both from and to)
            if ($filter && $filter !== 'all') {
                $totalQuery->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }
            
            // New: Separate filters for fromstoreloc and tostoreloc
            if ($filterFrom && $filterFrom !== 'all') {
                $totalQuery->where('loc_from.location', 'LIKE', '%' . $filterFrom . '%');
            }
            
            if ($filterTo && $filterTo !== 'all') {
                $totalQuery->where('loc_to.location', 'LIKE', '%' . $filterTo . '%');
            }
            
            // Apply same filters for nomor dokumen, part number, and no. reg
            if ($filterNoDok) {
                $totalQuery->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }
            
            if ($filterPartNumber) {
                $totalQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            if ($filterNoReg) {
                $totalQuery->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            // Apply nama barang filter for count
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $totalQuery->where('item.description', $filterNamaBarang);
            }
            
            // Apply site filter for count
            if ($filterSite && $filterSite !== 'all') {
                $totalQuery->where('site.siteid', $filterSite);
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

    public function getTransaksiGudangList(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $userSite = $request->get('user_site');
            $siteFilter = $request->get('site_filter');
            
            // Gunakan raw SQL untuk menggabungkan dan mendeduplikasi gudang dari location table
            $query = "
                SELECT DISTINCT loc.location as gudang 
                FROM location loc
                INNER JOIN site s ON loc.idsite = s.id
                WHERE loc.location IS NOT NULL 
                  AND loc.location != '' 
                  AND loc.location != ' '
            ";
            
            // Apply site filtering for admin and user
            if ($userRole === 'admin' && $siteFilter) {
                $query .= " AND s.siteid = " . DB::getPdo()->quote($siteFilter);
            } elseif ($userRole === 'user' && $userSite) {
                $query .= " AND s.siteid = " . DB::getPdo()->quote($userSite);
            }
            
            $query .= " ORDER BY loc.location";
            
            $gudangList = DB::select($query);

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
            $userLocId = $request->get('user_locid'); // Location ID for User role
            $userRole = $request->get('user_role', 'superadmin');
            
            // Additional filters from transaksi table
            $filterFrom = $request->get('filter_from', 'all');
            $filterTo = $request->get('filter_to', 'all');
            $filterNoDok = $request->get('filter_nodok');
            $filterPartNumber = $request->get('filter_partnumber');
            $filterNoReg = $request->get('filter_noreg');
            $filterNamaBarang = $request->get('filter_namabarang');
            $filterSite = $request->get('filter_site');
            
            // Build base query using invuse table with joins
            $baseQuery = DB::table('invuse')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum')
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id');
            
            // Apply site/location filtering based on role
            if ($userRole === 'admin' && $siteFilter) {
                // Admin: filter by site.siteid (string)
                $baseQuery->where('site.siteid', $siteFilter);
            } elseif ($userRole === 'user' && $userLocId) {
                // User: filter by location ID (tostoreloc OR fromstoreloc)
                $baseQuery->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            }
            
            // Apply location filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }
            
            // Apply additional filters
            if ($filterNoDok) {
                // Use nomerdokumen (document number) like getTransaksi()
                $baseQuery->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }

            if ($filterPartNumber) {
                // Part number column is `pn` in `item` table (used by getTransaksi)
                $baseQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            if ($filterNoReg) {
                $baseQuery->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $baseQuery->where('item.description', $filterNamaBarang);
            }
            
            if ($filterFrom && $filterFrom !== 'all') {
                $baseQuery->where('loc_from.location', $filterFrom);
            }
            
            if ($filterTo && $filterTo !== 'all') {
                $baseQuery->where('loc_to.location', $filterTo);
            }
            
            if ($filterSite && $filterSite !== 'all') {
                $baseQuery->where('site.siteid', $filterSite);
            }

            // Get statistics for each status type
            $statusPermintaan = (clone $baseQuery)
                ->select('invuse.statpermintaan', DB::raw('COUNT(*) as count'))
                ->whereNotNull('invuse.statpermintaan')
                ->where('invuse.statpermintaan', '!=', '')
                ->groupBy('invuse.statpermintaan')
                ->get();

            $statusPenerimaan = (clone $baseQuery)
                ->select('invuse.receipts', DB::raw('COUNT(*) as count'))
                ->whereNotNull('invuse.receipts')
                ->where('invuse.receipts', '!=', '')
                ->groupBy('invuse.receipts')
                ->get();

            $statusPengiriman = (clone $baseQuery)
                ->select('invuse.status', DB::raw('COUNT(*) as count'))
                ->whereNotNull('invuse.status')
                ->where('invuse.status', '!=', '')
                ->groupBy('invuse.status')
                ->get();

            return response()->json([
                'status_permintaan' => $statusPermintaan->map(function($item) {
                    return [
                        'label' => $item->statpermintaan,
                        'count' => $item->count
                    ];
                }),
                'status_penerimaan' => $statusPenerimaan->map(function($item) {
                    return [
                        'label' => $item->receipts,
                        'count' => $item->count
                    ];
                }),
                'status_pengiriman' => $statusPengiriman->map(function($item) {
                    return [
                        'label' => $item->status,
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
            
            // Get additional filters
            $filterNoDok = $request->get('filter_nodok', '');
            $filterPartNumber = $request->get('filter_partnumber', '');
            $filterNoReg = $request->get('filter_noreg', '');
            $filterNamaBarang = $request->get('filter_namabarang', 'all');
            $filterSite = $request->get('filter_site', 'all');
            $siteFilter = $request->get('site_filter', '');
            $userRole = $request->get('user_role', '');
            $userLocid = $request->get('user_locid', '');
            
            if (!$statusType || !$statusValue) {
                return response()->json([
                    'error' => 'Missing required parameters: status_type and status_value'
                ], 400);
            }

            // Map frontend status types to database columns
            $statusColumnMap = [
                'status_permintaan' => 'statpermintaan',
                'status_penerimaan' => 'receipts',
                'status_pengiriman' => 'status'
            ];
            
            $dbStatusColumn = $statusColumnMap[$statusType] ?? null;
            if (!$dbStatusColumn) {
                return response()->json([
                    'error' => 'Invalid status_type'
                ], 400);
            }

            // Build base query using invuse table with joins
            $baseQuery = DB::table('invuse')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum')
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id');
            
            // Apply location filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }

            // Apply additional filters
            if (!empty($filterNoDok)) {
                $baseQuery->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }
            
            if (!empty($filterPartNumber)) {
                $baseQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            if (!empty($filterNoReg)) {
                $baseQuery->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $baseQuery->where('item.description', $filterNamaBarang);
            }
            
            if ($filterSite && $filterSite !== 'all') {
                $baseQuery->where('site.siteid', $filterSite);
            }
            
            // Apply site filter for admin role
            if ($userRole === 'admin' && !empty($siteFilter)) {
                $baseQuery->where('site.siteid', $siteFilter);
            }
            
            // Apply user location filter for user role
            if ($userRole === 'user' && !empty($userLocid)) {
                $baseQuery->where(function($q) use ($userLocid) {
                    $q->where('invuse.fromstoreloc', $userLocid)
                      ->orWhere('invuse.tostoreloc', $userLocid);
                });
            }

            // Filter by specific status
            $baseQuery->where('invuse.' . $dbStatusColumn, $statusValue);

            // Get breakdown by warehouse depending on status type
            $warehouseBreakdown = [];
            
            if ($statusType === 'status_permintaan') {
                // For permintaan, show from which gudang the requests are coming
                $warehouseBreakdown = (clone $baseQuery)
                    ->select('loc_from.location as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('loc_from.location')
                    ->where('loc_from.location', '!=', '')
                    ->where('loc_from.location', '!=', ' ')
                    ->groupBy('loc_from.location')
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
                $warehouseBreakdown = (clone $baseQuery)
                    ->select('loc_to.location as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('loc_to.location')
                    ->where('loc_to.location', '!=', '')
                    ->where('loc_to.location', '!=', ' ')
                    ->groupBy('loc_to.location')
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
                $warehouseBreakdown = (clone $baseQuery)
                    ->select('loc_from.location as gudang', DB::raw('COUNT(*) as count'))
                    ->whereNotNull('loc_from.location')
                    ->where('loc_from.location', '!=', '')
                    ->where('loc_from.location', '!=', ' ')
                    ->groupBy('loc_from.location')
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
            $userLocId = $request->get('user_locid'); // Location ID for User role
            $userRole = $request->get('user_role', 'superadmin');
            
            // Additional filters from transaksi table
            $filterFrom = $request->get('filter_from', 'all');
            $filterTo = $request->get('filter_to', 'all');
            $filterNoDok = $request->get('filter_nodok');
            $filterPartNumber = $request->get('filter_partnumber');
            $filterNoReg = $request->get('filter_noreg');
            $filterNamaBarang = $request->get('filter_namabarang');
            $filterSite = $request->get('filter_site');
            
            // Build base query using invuse table with joins
            $baseQuery = DB::table('invuse')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum')
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id');
            
            // Apply site/location filtering based on role
            if ($userRole === 'admin' && $siteFilter) {
                // Admin: filter by site.siteid (string)
                $baseQuery->where('site.siteid', $siteFilter);
            } elseif ($userRole === 'user' && $userLocId) {
                // User: filter by location ID (tostoreloc OR fromstoreloc)
                $baseQuery->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            }
            
            // Apply location filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }
            
            // Apply additional filters
            if ($filterNoDok) {
                $baseQuery->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }
            
            if ($filterPartNumber) {
                $baseQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }
            
            if ($filterNoReg) {
                $baseQuery->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $baseQuery->where('item.description', $filterNamaBarang);
            }
            
            if ($filterFrom && $filterFrom !== 'all') {
                $baseQuery->where('loc_from.location', $filterFrom);
            }
            
            if ($filterTo && $filterTo !== 'all') {
                $baseQuery->where('loc_to.location', $filterTo);
            }
            
            if ($filterSite && $filterSite !== 'all') {
                $baseQuery->where('site.siteid', $filterSite);
            }

            // Get top active warehouses as "dari_gudang" (outgoing)
            $topFromWarehouses = (clone $baseQuery)
                ->select('loc_from.location as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('loc_from.location')
                ->where('loc_from.location', '!=', '')
                ->where('loc_from.location', '!=', ' ')
                ->groupBy('loc_from.location')
                ->orderBy('count', 'desc')
                ->limit($limit)
                ->get();

            // Get top active warehouses as "ke_gudang" (incoming)
            $topToWarehouses = (clone $baseQuery)
                ->select('loc_to.location as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('loc_to.location')
                ->where('loc_to.location', '!=', '')
                ->where('loc_to.location', '!=', ' ')
                ->groupBy('loc_to.location')
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
            $userLocId = $request->get('user_locid');
            
            // Additional filters from transaksi table
            $filterFrom = $request->get('filter_from', 'all');
            $filterTo = $request->get('filter_to', 'all');
            $filterNoDok = $request->get('filter_nodok');
            $filterPartNumber = $request->get('filter_partnumber');
            $filterNoReg = $request->get('filter_noreg');
            $filterNamaBarang = $request->get('filter_namabarang');
            $filterSite = $request->get('filter_site');
            
            // Build base query using invuse table with joins
            $baseQuery = DB::table('invuse')
                ->leftJoin('item', 'invuse.itemnum', '=', 'item.itemnum')
                ->leftJoin('site', 'invuse.idsite', '=', 'site.id')
                ->leftJoin('location as loc_from', 'invuse.fromstoreloc', '=', 'loc_from.id')
                ->leftJoin('location as loc_to', 'invuse.tostoreloc', '=', 'loc_to.id');
            
            // Apply site/location filtering based on role
            if ($userRole === 'admin' && $siteFilter) {
                $baseQuery->where('site.siteid', $siteFilter);
            } elseif ($userRole === 'user' && $userLocId) {
                $baseQuery->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            }
            
            // Apply location filter if not 'all'
            if ($filter && $filter !== 'all') {
                $baseQuery->where(function($q) use ($filter) {
                    $q->where('loc_from.location', 'LIKE', '%' . $filter . '%')
                      ->orWhere('loc_to.location', 'LIKE', '%' . $filter . '%');
                });
            }
            
            // Apply additional filters
            if ($filterNoDok) {
                // document number column (nomerdokumen)
                $baseQuery->where('invuse.nomerdokumen', 'LIKE', '%' . $filterNoDok . '%');
            }

            if ($filterPartNumber) {
                // part number is stored in item.pn
                $baseQuery->where('item.pn', 'LIKE', '%' . $filterPartNumber . '%');
            }

            if ($filterNoReg) {
                // registration number column
                $baseQuery->where('invuse.no_reg_sista', 'LIKE', '%' . $filterNoReg . '%');
            }
            
            if ($filterNamaBarang && $filterNamaBarang !== 'all') {
                $baseQuery->where('item.description', $filterNamaBarang);
            }
            
            if ($filterFrom && $filterFrom !== 'all') {
                $baseQuery->where('loc_from.location', $filterFrom);
            }
            
            if ($filterTo && $filterTo !== 'all') {
                $baseQuery->where('loc_to.location', $filterTo);
            }
            
            if ($filterSite && $filterSite !== 'all') {
                $baseQuery->where('site.siteid', $filterSite);
            }
            
            // Get warehouse activity statistics
            $fromWarehouseStats = (clone $baseQuery)
                ->select('loc_from.location as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('loc_from.location')
                ->where('loc_from.location', '!=', '')
                ->groupBy('loc_from.location')
                ->get();
                
            $toWarehouseStats = (clone $baseQuery)
                ->select('loc_to.location as warehouse', DB::raw('COUNT(*) as count'))
                ->whereNotNull('loc_to.location')
                ->where('loc_to.location', '!=', '')
                ->groupBy('loc_to.location')
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

    public function getUsers(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 15);
            $searchTerm = $request->get('search', '');
            
            $query = DB::table('user')
                ->join('site', 'user.siteid', '=', 'site.id')
                ->select([
                    'user.id',
                    'user.username',
                    'user.Nama',
                    'user.NRP',
                    'user.Email',
                    'user.id_status',
                    'site.siteid as site_name'
                ]);

            // Apply search filter if provided
            if (!empty($searchTerm)) {
                $query->where(function($q) use ($searchTerm) {
                    $q->where('user.username', 'like', "%{$searchTerm}%")
                      ->orWhere('user.Nama', 'like', "%{$searchTerm}%")
                      ->orWhere('user.Email', 'like', "%{$searchTerm}%")
                      ->orWhere('user.NRP', 'like', "%{$searchTerm}%")
                      ->orWhere('site.siteid', 'like', "%{$searchTerm}%");
                });
            }

            $total = $query->count();
            $users = $query->orderBy('user.id', 'desc')
                          ->skip(($page - 1) * $perPage)
                          ->take($perPage)
                          ->get();

            // Add role name based on id_status
            $users = $users->map(function($user) {
                switch($user->id_status) {
                    case 1:
                        $user->role_name = 'SuperAdmin';
                        break;
                    case 2:
                        $user->role_name = 'Admin';
                        break;
                    case 3:
                        $user->role_name = 'User';
                        break;
                    default:
                        $user->role_name = 'Unknown';
                }
                return $user;
            });

            $lastPage = ceil($total / $perPage);

            return response()->json([
                'data' => $users,
                'current_page' => (int) $page,
                'last_page' => $lastPage,
                'per_page' => (int) $perPage,
                'total' => $total,
                'search' => $searchTerm
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching users data',
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

    public function deleteUser($id)
    {
        try {
            $deleted = DB::table('user')->where('id', $id)->delete();
            
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'User berhasil dihapus'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getGudangModalData(Request $request)
    {
        try {
            $page = max(1, (int) $request->input('page', 1)); // Ensure page is at least 1
            $perPage = max(1, (int) $request->input('per_page', 10)); // Ensure per_page is at least 1
            $siteFilter = $request->input('site_filter');

            // Query untuk get data location dengan join ke site
            $query = DB::table('location')
                ->leftJoin('site', 'location.idsite', '=', 'site.id')
                ->select(
                    'location.id',
                    'location.location as gudang',
                    'location.idsite',
                    'site.siteid as site_name'
                )
                ->orderBy('location.location', 'asc');

            // Apply site filter when provided (site_filter is expected to be site.siteid string)
            if (!empty($siteFilter)) {
                $query->where('site.siteid', $siteFilter);
            }

            // Get total count
            $total = $query->count();
            $totalPages = max(1, ceil($total / $perPage));
            
            // Validate page number - if exceeds total pages, set to last page
            if ($page > $totalPages) {
                $page = $totalPages;
            }

            $offset = ($page - 1) * $perPage;

            // Get paginated data
            $data = $query->offset($offset)
                ->limit($perPage)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'total' => $total,
                    'total_pages' => $totalPages
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data gudang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSiteModalData(Request $request)
    {
        try {
            $page = max(1, (int) $request->input('page', 1)); // Ensure page is at least 1
            $perPage = max(1, (int) $request->input('per_page', 10)); // Ensure per_page is at least 1
            $siteFilter = $request->input('site_filter'); // Get site filter (site.siteid string)

            // Build base query
            $baseQuery = DB::table('site');

            // Apply site filter if provided (filter by site.siteid)
            if (!empty($siteFilter)) {
                $baseQuery->where('site.siteid', $siteFilter);
            }

            // Get total count first
            $total = $baseQuery->count();
            $totalPages = max(1, ceil($total / $perPage));
            
            // Validate page number - if exceeds total pages, set to last page
            if ($page > $totalPages) {
                $page = $totalPages;
            }

            $offset = ($page - 1) * $perPage;

            // Query untuk get data site
            $dataQuery = DB::table('site')
                ->select(
                    'site.id',
                    'site.siteid',
                    DB::raw('COUNT(location.id) as total_gudang')
                )
                ->leftJoin('location', 'site.id', '=', 'location.idsite');

            // Apply site filter to data query as well
            if (!empty($siteFilter)) {
                $dataQuery->where('site.siteid', $siteFilter);
            }

            $data = $dataQuery
                ->groupBy('site.id', 'site.siteid')
                ->orderBy('site.siteid', 'asc')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => (int) $page,
                    'per_page' => (int) $perPage,
                    'total' => $total,
                    'total_pages' => $totalPages
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data site: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addGudang(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'location' => 'required|string|max:255',
                'idsite' => 'required|integer|exists:site,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data gudang tidak valid: ' . $validator->errors()->first()
                ], 422);
            }

            // Check if location already exists for this site
            $exists = DB::table('location')
                ->where('location', $request->location)
                ->where('idsite', $request->idsite)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gudang dengan nama ini sudah ada di site tersebut'
                ], 422);
            }

            DB::table('location')->insert([
                'location' => $request->location,
                'idsite' => $request->idsite
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gudang berhasil ditambahkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan gudang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addSite(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'siteid' => 'required|string|max:255|unique:site,siteid'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Site ID sudah ada atau tidak valid'
                ], 422);
            }

            DB::table('site')->insert([
                'siteid' => $request->siteid
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Site berhasil ditambahkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan site: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSiteList(Request $request)
    {
        try {
            // Get all sites for dropdown
            $sites = DB::table('site')
                ->select('id', 'siteid')
                ->orderBy('siteid', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $sites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data site: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getItemList(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $userLocId = $request->get('user_locid'); // Get user location ID for filtering
            
            // Jika ada user_locid, filter berdasarkan inventory dan invbalance
            if ($userLocId) {
                $query = DB::table('inventory')
                    ->select('item.itemnum', 'item.description', 'item.pn')
                    ->join('item', 'inventory.itemnum', '=', 'item.itemnum')
                    ->join('invbalance', function($join) {
                        $join->on('inventory.itemnum', '=', 'invbalance.itemnum')
                             ->on(DB::raw('(SELECT location.location FROM location WHERE location.id = inventory.idlocation)'), '=', 'invbalance.location');
                    })
                    ->where('inventory.idlocation', $userLocId)
                    ->where('invbalance.curbal', '>', 0)
                    ->distinct()
                    ->orderBy('item.itemnum', 'asc');
                
                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('item.itemnum', 'like', '%' . $search . '%')
                          ->orWhere('item.description', 'like', '%' . $search . '%')
                          ->orWhere('item.pn', 'like', '%' . $search . '%');
                    });
                }
            } else {
                // Jika tidak ada user_locid, tampilkan semua item (untuk keperluan lain)
                $query = DB::table('item')
                    ->select('itemnum', 'description', 'pn')
                    ->orderBy('itemnum', 'asc');
                
                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('itemnum', 'like', '%' . $search . '%')
                          ->orWhere('description', 'like', '%' . $search . '%')
                          ->orWhere('pn', 'like', '%' . $search . '%');
                    });
                }
            }
            
            $items = $query->get();
            
            return response()->json([
                'success' => true,
                'data' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addItem(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'itemnum' => 'required|string',
                'binnum' => 'required|string',
                'jumlah' => 'required|numeric|min:0',
                'user_locid' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            $itemnum = $request->itemnum;
            $binnum = $request->binnum;
            $jumlah = $request->jumlah;
            $userLocId = $request->user_locid;

            DB::beginTransaction();

            // 1. Cek apakah data sudah ada di inventory berdasarkan itemnum dan idlocation
            $inventory = DB::table('inventory')
                ->where('itemnum', $itemnum)
                ->where('idlocation', $userLocId)
                ->first();

            if ($inventory) {
                // Update statusdate dan binnum jika data sudah ada
                DB::table('inventory')
                    ->where('itemnum', $itemnum)
                    ->where('idlocation', $userLocId)
                    ->update([
                        'statusdate' => now(),
                        'binnum' => $binnum
                    ]);
            } else {
                // Tambah data baru jika belum ada
                DB::table('inventory')->insert([
                    'itemnum' => $itemnum,
                    'statusdate' => now(),
                    'binnum' => $binnum,
                    'idlocation' => $userLocId
                ]);
            }

            // 2. Ambil nama location berdasarkan idlocation
            $location = DB::table('location')
                ->where('id', $userLocId)
                ->value('location');

            if (!$location) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Location tidak ditemukan'
                ], 404);
            }

            // 3. Cek apakah data sudah ada di invbalance berdasarkan itemnum dan location
            $invbalance = DB::table('invbalance')
                ->where('itemnum', $itemnum)
                ->where('location', $location)
                ->first();

            if ($invbalance) {
                // Update curbal jika data sudah ada
                DB::table('invbalance')
                    ->where('itemnum', $itemnum)
                    ->where('location', $location)
                    ->update([
                        'curbal' => $jumlah
                    ]);
            } else {
                // Tambah data baru jika belum ada
                DB::table('invbalance')->insert([
                    'itemnum' => $itemnum,
                    'location' => $location,
                    'curbal' => $jumlah
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Barang berhasil ditambahkan'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan barang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addItemType(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'itemnum' => 'required|string|unique:item,itemnum',
                'description' => 'required|string',
                'pn' => 'required|string',
                'issueunit' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Insert data ke table item
            DB::table('item')->insert([
                'itemnum' => $request->itemnum,
                'description' => $request->description,
                'pn' => $request->pn,
                'issueunit' => $request->issueunit
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jenis barang berhasil ditambahkan'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan jenis barang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getLocationList(Request $request)
    {
        try {
            $search = $request->get('search', '');
            
            $query = DB::table('location')
                ->select('id', 'location')
                ->whereNotNull('location')
                ->where('location', '!=', '');
            
            if ($search) {
                $query->where('location', 'LIKE', '%' . $search . '%');
            }
            
            $locations = $query->orderBy('location')->get();
            
            return response()->json([
                'success' => true,
                'data' => $locations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching location list: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addTransaksi(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'nomerdokumen' => 'required|string',
                'itemnum' => 'required|string',
                'tostoreloc' => 'required|integer',
                'no_reg_sista' => 'required|string',
                'statpermintaan' => 'required|string',
                'status' => 'required|string',
                'diminta' => 'required|numeric|min:0',
                'dikirim' => 'required|numeric|min:0',
                'user_locid' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get max invusenum and increment by 1
            $maxInvusenum = DB::table('invuse')->max('invusenum');
            $newInvusenum = $maxInvusenum ? $maxInvusenum + 1 : 1;

            // Get idsite from user's location
            $userLocation = DB::table('location')
                ->where('id', $request->user_locid)
                ->first();

            if (!$userLocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lokasi user tidak ditemukan'
                ], 404);
            }

            $idsite = $userLocation->idsite;

            // Validasi stok di gudang
            // Cek apakah jumlah dikirim melebihi stok yang tersedia
            $stokTersedia = DB::table('invbalance')
                ->where('itemnum', $request->itemnum)
                ->where('location', $userLocation->location)
                ->value('curbal');

            if ($stokTersedia === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Item tidak ditemukan di gudang'
                ], 404);
            }

            if ($request->dikirim > $stokTersedia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data di gudang kurang. Stok tersedia: ' . $stokTersedia
                ], 400);
            }

            // Begin transaction
            DB::beginTransaction();

            try {
                // Insert data ke table invuseline DULU (sebelum invuse)
                // karena foreign key iu_iul di invuse mereferensi invusenum di invuseline
                DB::table('invuseline')->insert([
                    'invusenum' => $newInvusenum,
                    'requestqty' => $request->diminta,
                    'quantity' => $request->dikirim
                ]);

                // Insert data ke table invuse SETELAH invuseline
                DB::table('invuse')->insert([
                    'invusenum' => $newInvusenum,
                    'nomerdokumen' => $request->nomerdokumen,
                    'itemnum' => $request->itemnum,
                    'fromstoreloc' => $request->user_locid,
                    'tostoreloc' => $request->tostoreloc,
                    'no_reg_sista' => $request->no_reg_sista,
                    'statpermintaan' => $request->statpermintaan,
                    'receipts' => 'NONE',
                    'status' => $request->status,
                    'idsite' => $idsite
                ]);

                // Commit transaction
                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Transaksi berhasil ditambahkan'
                ]);

            } catch (\Exception $e) {
                // Rollback transaction on error
                DB::rollBack();
                
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menambahkan transaksi: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateTransaksiStatus(Request $request)
    {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                'invusenum' => 'required',
                'status_type' => 'required|in:permintaan,penerimaan,pengiriman',
                'status_value' => 'required|string',
                'old_status_value' => 'nullable|string',
                'jumlah_dikirim' => 'nullable|numeric|min:0',
                'jumlah_terkirim' => 'nullable|numeric|min:0',
                'rak_binnum' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Map status_type to column name
            $columnMap = [
                'permintaan' => 'statpermintaan',
                'penerimaan' => 'receipts',
                'pengiriman' => 'status'
            ];

            $column = $columnMap[$request->status_type];

            // Begin transaction
            DB::beginTransaction();

            try {
                // Ambil data invuse dan invuseline
                $invuse = DB::table('invuse')
                    ->where('invusenum', $request->invusenum)
                    ->first();

                if (!$invuse) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Transaksi tidak ditemukan'
                    ], 404);
                }

                $invuseline = DB::table('invuseline')
                    ->where('invusenum', $request->invusenum)
                    ->first();

                // Update status di table invuse
                $updated = DB::table('invuse')
                    ->where('invusenum', $request->invusenum)
                    ->update([
                        $column => $request->status_value
                    ]);

                // Jika status permintaan dan ada jumlah dikirim, update tabel invuseline
                if ($request->status_type === 'permintaan' && $request->has('jumlah_dikirim')) {
                    DB::table('invuseline')
                        ->where('invusenum', $request->invusenum)
                        ->update([
                            'quantity' => $request->jumlah_dikirim
                        ]);
                }

                // PROSES UNTUK STATUS PENERIMAAN
                if ($request->status_type === 'penerimaan') {
                    $oldStatus = $request->old_status_value ?? $invuse->receipts;
                    $newStatus = $request->status_value;

                    // Ambil lokasi asal dan tujuan
                    $lokasiAsal = DB::table('location')
                        ->where('id', $invuse->fromstoreloc)
                        ->first();
                    
                    $lokasiTujuan = DB::table('location')
                        ->where('id', $invuse->tostoreloc)
                        ->first();

                    if (!$lokasiAsal || !$lokasiTujuan) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => 'Lokasi tidak ditemukan'
                        ], 404);
                    }

                    // Case 1: NONE -> COMPLETE
                    if ($oldStatus === 'NONE' && $newStatus === 'COMPLETE') {
                        $quantityToProcess = $invuseline->quantity;

                        // Insert/Update inventory
                        $this->updateInventory($invuse->itemnum, $request->rak_binnum, $invuse->tostoreloc);

                        // Update invbalance - Tambah stok di lokasi tujuan
                        $this->updateInvbalance($invuse->itemnum, $lokasiTujuan->location, $quantityToProcess, 'add');

                        // Update invbalance - Kurangi stok di lokasi asal
                        $this->updateInvbalance($invuse->itemnum, $lokasiAsal->location, $quantityToProcess, 'subtract');
                    }
                    // Case 2: NONE -> PARTIAL
                    elseif ($oldStatus === 'NONE' && $newStatus === 'PARTIAL') {
                        $quantityToProcess = $request->jumlah_terkirim;

                        // Update quantity di invuseline dengan jumlah terkirim
                        DB::table('invuseline')
                            ->where('invusenum', $request->invusenum)
                            ->update([
                                'quantity' => $quantityToProcess
                            ]);

                        // Insert/Update inventory
                        $this->updateInventory($invuse->itemnum, $request->rak_binnum, $invuse->tostoreloc);

                        // Update invbalance - Tambah stok di lokasi tujuan
                        $this->updateInvbalance($invuse->itemnum, $lokasiTujuan->location, $quantityToProcess, 'add');

                        // Update invbalance - Kurangi stok di lokasi asal
                        $this->updateInvbalance($invuse->itemnum, $lokasiAsal->location, $quantityToProcess, 'subtract');
                    }
                    // Case 3: PARTIAL -> COMPLETE
                    elseif ($oldStatus === 'PARTIAL' && $newStatus === 'COMPLETE') {
                        // Hitung sisa yang belum terkirim: requestqty - quantity (yang sudah terkirim di PARTIAL)
                        $sisaQuantity = $invuseline->requestqty - $invuseline->quantity;

                        // Insert/Update inventory
                        $this->updateInventory($invuse->itemnum, $request->rak_binnum, $invuse->tostoreloc);

                        // Hanya proses jika masih ada sisa yang perlu dikirim
                        if ($sisaQuantity > 0) {
                            // Update invbalance - Tambah stok di lokasi tujuan
                            $this->updateInvbalance($invuse->itemnum, $lokasiTujuan->location, $sisaQuantity, 'add');

                            // Update invbalance - Kurangi stok di lokasi asal
                            $this->updateInvbalance($invuse->itemnum, $lokasiAsal->location, $sisaQuantity, 'subtract');
                        }

                        // Terakhir: Update quantity = requestqty (menandakan semua sudah terkirim)
                        DB::table('invuseline')
                            ->where('invusenum', $request->invusenum)
                            ->update([
                                'quantity' => $invuseline->requestqty
                            ]);
                    }
                }

                DB::commit();

                if ($updated) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Status berhasil diupdate'
                    ]);
                } else {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal update status'
                    ], 500);
                }

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal update status: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error update status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method untuk update/insert inventory
     */
    private function updateInventory($itemnum, $binnum, $idlocation)
    {
        $now = date('Y-m-d H:i:s');

        // Cek apakah sudah ada record dengan itemnum, binnum, dan idlocation yang sama
        $existing = DB::table('inventory')
            ->where('itemnum', $itemnum)
            ->where('idlocation', $idlocation);

        // Tambahkan filter binnum jika ada
        if ($binnum) {
            $existing->where('binnum', $binnum);
        } else {
            $existing->whereNull('binnum');
        }

        $existing = $existing->first();

        if ($existing) {
            // Update statusdate saja
            DB::table('inventory')
                ->where('id', $existing->id)
                ->update([
                    'statusdate' => $now
                ]);
        } else {
            // Insert record baru
            DB::table('inventory')->insert([
                'itemnum' => $itemnum,
                'binnum' => $binnum,
                'idlocation' => $idlocation,
                'statusdate' => $now
            ]);
        }
    }

    /**
     * Helper method untuk update invbalance
     */
    private function updateInvbalance($itemnum, $location, $quantity, $operation)
    {
        // Cari record dengan itemnum dan location
        $invbalance = DB::table('invbalance')
            ->where('itemnum', $itemnum)
            ->where('location', $location)
            ->first();

        if ($invbalance) {
            // Update curbal
            if ($operation === 'add') {
                DB::table('invbalance')
                    ->where('itemnum', $itemnum)
                    ->where('location', $location)
                    ->update([
                        'curbal' => DB::raw("curbal + $quantity")
                    ]);
            } elseif ($operation === 'subtract') {
                DB::table('invbalance')
                    ->where('itemnum', $itemnum)
                    ->where('location', $location)
                    ->update([
                        'curbal' => DB::raw("curbal - $quantity")
                    ]);
            }
        } else {
            // Insert record baru (hanya untuk operasi add)
            if ($operation === 'add') {
                DB::table('invbalance')->insert([
                    'itemnum' => $itemnum,
                    'location' => $location,
                    'curbal' => $quantity
                ]);
            }
        }
    }

    public function getNamaBarangList(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $siteFilter = $request->get('site_filter');
            $userLocId = $request->get('user_locid');

            $query = DB::table('item')
                ->select('item.description as nama_barang')
                ->distinct();

            // Filter based on user role - match with inventory in user's location/site
            if ($userRole === 'user' && $userLocId) {
                $query->join('inventory', 'item.itemnum', '=', 'inventory.itemnum')
                    ->where('inventory.idlocation', $userLocId);
            } elseif ($userRole === 'admin' && $siteFilter) {
                $query->join('inventory', 'item.itemnum', '=', 'inventory.itemnum')
                    ->join('location', 'inventory.idlocation', '=', 'location.id')
                    ->where('location.idsite', function($q) use ($siteFilter) {
                        $q->select('id')
                          ->from('site')
                          ->where('siteid', $siteFilter)
                          ->limit(1);
                    });
            }

            $namaBarangList = $query
                ->whereNotNull('item.description')
                ->where('item.description', '!=', '')
                ->orderBy('item.description')
                ->get();

            return response()->json([
                'data' => $namaBarangList,
                'total_count' => $namaBarangList->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'total_count' => 0,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getTransaksiNamaBarangList(Request $request)
    {
        try {
            $userRole = $request->get('user_role', 'superadmin');
            $siteFilter = $request->get('site_filter');
            $userLocId = $request->get('user_locid');

            $query = DB::table('item')
                ->join('invuse', 'item.itemnum', '=', 'invuse.itemnum')
                ->select('item.description as nama_barang')
                ->distinct();

            // Filter based on user role
            if ($userRole === 'user' && $userLocId) {
                $query->where(function($q) use ($userLocId) {
                    $q->where('invuse.tostoreloc', $userLocId)
                      ->orWhere('invuse.fromstoreloc', $userLocId);
                });
            } elseif ($userRole === 'admin' && $siteFilter) {
                $query->join('site', 'invuse.idsite', '=', 'site.id')
                    ->where('site.siteid', $siteFilter);
            }

            $namaBarangList = $query
                ->whereNotNull('item.description')
                ->where('item.description', '!=', '')
                ->orderBy('item.description')
                ->get();

            return response()->json([
                'data' => $namaBarangList,
                'total_count' => $namaBarangList->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'total_count' => 0,
                'error' => $e->getMessage()
            ]);
        }
    }
}
