<?php
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If URL is like /index.php/home or /index.php/sell, extract the target route
if (preg_match('#^/index\.php/(.+)$#', $path, $matches)) {
    $cleanPath = $matches[1];
} else {
    $cleanPath = ltrim($path, '/');
}

$filePath = __DIR__ . '/' . $cleanPath;
if ($cleanPath !== '' && file_exists($filePath) && !is_dir($filePath)) {
    return false; // serve static file as-is
}

// Map clean URL paths to PHP files matching .htaccess rules
$routes = [
    'admin' => 'admin.php',
    'home' => 'home.php',
    'buyersDetails' => 'buyersDetails.php',
    'index' => 'index.php',
    'expenditures' => 'expendituresScreen.php',
    'cashCollection' => 'cashCollectionScreen.php',
    'bills' => 'getBills.php',
    'sms' => 'smsScreen.php',
    'advance' => 'addAdvanceScreen.php',
    'balancesheet' => 'balanceSheet.php',
    'sell' => 'addSoldData.php',
    'beatpaper' => 'printBeatPaper.php',
    'kisanbalance' => 'viewBillsByFarmer.php',
    'sales' => 'viewSalesByName.php',
    'notpaidbills' => 'notPaidBillsScreen.php',
    'paidBills' => 'paidBills.php',
    'shops' => 'shopsScreen.php',
    'summary' => 'summary.php',
    'logout' => 'logout.php',
    'bags' => 'bagsData.php',
    'settings' => 'settings.php',
    'printbillkisan' => 'getPrintBillScreen.php',
    'kisans' => 'kisan.php',
    'icf' => 'icf.php',
    'localSale' => 'localSale.php',
    'localSaleBills' => 'viewBillsByLocalSale.php'
];

if (isset($routes[$cleanPath]) && file_exists(__DIR__ . '/' . $routes[$cleanPath])) {
    require __DIR__ . '/' . $routes[$cleanPath];
    return true;
}

if (file_exists(__DIR__ . '/' . $cleanPath . '.php')) {
    require __DIR__ . '/' . $cleanPath . '.php';
    return true;
}

require __DIR__ . '/index.php';
