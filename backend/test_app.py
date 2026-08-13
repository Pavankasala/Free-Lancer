import unittest
import json
import os
import tempfile
import time
import db
import app as flask_app


class AgriCommissionManagerTestCase(unittest.TestCase):
    def setUp(self):
        # Create isolated temporary database for test run
        self.db_fd, self.db_path = tempfile.mkstemp()
        db.DATABASE_URL = None
        db.DATABASE_PATH = self.db_path
        
        self.app = flask_app.create_app({'TESTING': True})
        self.client = self.app.test_client()

        # Sign up a test user to obtain a valid JWT token for authenticated endpoints
        res = self.client.post('/api/signup', json={
            'name': 'Test Operator',
            'email': 'operator@test.com',
            'password': 'password123'
        })
        data = json.loads(res.data)
        self.token = data.get('access_token') or data.get('token')
        self.auth_headers = {'Authorization': f'Bearer {self.token}'} if self.token else {}

    def tearDown(self):
        os.close(self.db_fd)
        if os.path.exists(self.db_path):
            try:
                os.remove(self.db_path)
            except OSError:
                pass

    def test_01_auth_login_success(self):
        res = self.client.post('/api/login', json={'email': 'operator@test.com', 'password': 'password123'})
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('user', data)
        self.assertIn('access_token', data)

    def test_02_auth_login_invalid_password(self):
        res = self.client.post('/api/login', json={'email': 'operator@test.com', 'password': 'wrongpassword'})
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])

    def test_03_auth_login_missing_fields(self):
        res = self.client.post('/api/login', json={'username': ''})
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 400)
        self.assertFalse(data['success'])

    def test_04_kisan_bill_creation_and_status(self):
        payload = {
            'name': 'Test Kisan',
            'billdate': '2026-08-09',
            'advanceTime': '12:00 PM',
            'items': [
                {'bags': 10, 'price': 1000},
                {'bags': 5, 'price': 500}
            ],
            'hamali': 10,
            'advance': 100
        }
        res = self.client.post('/api/add-bill', json=payload, headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        res2 = self.client.get('/api/home-bills?date=2026-08-09', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        self.assertTrue(data2['success'])
        found = [b for b in data2['bills'] if b['name'] == 'Test Kisan']
        self.assertGreater(len(found), 0)
        self.assertEqual(found[0]['paid'], 'NO')

    def test_05_bill_update_and_confirm_edge_cases(self):
        res = self.client.post('/api/add-bill', json={
            'name': 'Update Bill Kisan',
            'no_of_bags': 50,
            'price': 50,
            'advance': 5,
            'billdate': '2026-08-09'
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)

        res2 = self.client.get('/api/home-bills?date=2026-08-09', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        target = [b for b in data2['bills'] if b['name'] == 'Update Bill Kisan'][0]
        bill_id = target['id']

        res_confirm = self.client.post(f'/api/confirm-bill/{bill_id}', headers=self.auth_headers)
        self.assertEqual(res_confirm.status_code, 200)

        res3 = self.client.get('/api/home-bills?date=2026-08-09', headers=self.auth_headers)
        data3 = json.loads(res3.data)
        confirmed_bill = [b for b in data3['bills'] if b['id'] == bill_id][0]
        self.assertEqual(confirmed_bill['paid'], 'YES')
        self.assertEqual(confirmed_bill['confirmed'], 1)

        res_update = self.client.put(f'/api/update-bill/{bill_id}', json={
            'name': 'Update Bill Kisan',
            'no_of_bags': 50,
            'price': 50,
            'advance': 10,
            'date': '2026-08-09'
        }, headers=self.auth_headers)
        self.assertEqual(res_update.status_code, 200)

        res4 = self.client.get('/api/home-bills?date=2026-08-09', headers=self.auth_headers)
        data4 = json.loads(res4.data)
        updated_bill = [b for b in data4['bills'] if b['id'] == bill_id][0]
        self.assertEqual(updated_bill['paid'], 'NO')

    def test_06_advance_single_and_multi_creation(self):
        res = self.client.post('/api/advance', json={
            'name': 'SSL',
            'date': '2026-08-09',
            'amount': 5000
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)

        res_multi = self.client.post('/api/add-multi-advance', json={
            'date': '2026-08-09',
            'advances': {
                'AVR': 3000,
                'BVS': 0,
                'DPR': 1500
            }
        }, headers=self.auth_headers)
        self.assertEqual(res_multi.status_code, 200)

        res_list = self.client.get('/api/advances?date=2026-08-09', headers=self.auth_headers)
        data_list = json.loads(res_list.data)
        self.assertTrue(data_list['success'])
        names = [a['name'] for a in data_list['advances']]
        self.assertIn('SSL', names)
        self.assertIn('AVR', names)
        self.assertIn('DPR', names)

    def test_07_sold_data_crud(self):
        payload = {
            'date': '2026-08-09',
            'name': 'Trader A',
            'soldTo': 'Buyer X',
            'noOfBags': 100,
            'hamaliPerBag': 10,
            'partyCommission': '5%',
            'lorryNo': 'AP 24 T 1234',
            'lorryCharges': 2500,
            'tons': 5.5,
            'enam': 'Yes',
            'lorryAdvance': 1000,
            'villageRef': 'Nakrekal'
        }
        res = self.client.post('/api/sold-data', json=payload, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)

        res_get = self.client.get('/api/sold-data?date=2026-08-09', headers=self.auth_headers)
        data_get = json.loads(res_get.data)
        self.assertTrue(data_get['success'])
        self.assertGreater(len(data_get['sold_data']), 0)

    def test_08_buyer_balance_report(self):
        res = self.client.post('/api/add-buyer-bill', json={
            'name': 'Super Buyer',
            'billdate': '2026-08-09',
            'items': [{'bags': 20, 'price': 1000}],
            'advance': 5000
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)

        res_bal = self.client.get('/api/buyer-balance?year=2026', headers=self.auth_headers)
        data_bal = json.loads(res_bal.data)
        self.assertTrue(data_bal['success'])
        self.assertIn('summary', data_bal)
        self.assertGreater(data_bal['summary']['total_amount'], 0)

    def test_09_sms_formatting_generator(self):
        res = self.client.get('/api/sms-to-send?date=2026-08-09', headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertIn('sms_list', data)

    def test_10_account_linking_google_oauth_and_email_password(self):
        test_email = f"user_{int(time.time())}@example.com"
        # Step A: Signup via Email/Password
        signup_res = self.client.post('/api/signup', json={
            'name': 'Test User',
            'email': test_email,
            'password': 'mypassword123'
        })
        signup_data = json.loads(signup_res.data)
        self.assertEqual(signup_res.status_code, 201)
        original_user_id = signup_data['user']['user_id']

        # Step B: Sign in via Google OAuth using UPPERCASE/MixedCase version of the exact same email
        google_res = self.client.post('/api/google-auth', json={
            'name': 'Test User',
            'email': test_email.upper()
        })
        google_data = json.loads(google_res.data)
        self.assertEqual(google_res.status_code, 200)

        # Step C: VERIFY strictly unified user_id across sign-in methods!
        linked_user_id = google_data['user']['user_id']
        self.assertEqual(original_user_id, linked_user_id)
        self.assertEqual(google_data['user']['email'], test_email.lower())

    def test_11_hamali_per_bag_calculation_90_bags(self):
        """Test hamali deduction: 90 bags * ₹5 hamali = ₹450 deduction, not ₹5"""
        # Create a bill: 90 bags @ ₹100/bag = ₹9,000 gross
        # Hamali: ₹5 per bag = ₹450 total deduction
        # Commission: 4% of ₹9,000 = ₹360
        # Damage: 6% of ₹9,000 = ₹540
        # Net = 9000 - 360 - 450 - 540 = ₹7,650
        payload = {
            'name': 'Hamali Test Kisan',
            'billdate': '2026-08-13',
            'no_of_bags': 90,
            'price': 100,
            'hamali': 5,
            'advance': 0
        }
        res = self.client.post('/api/add-bill', json=payload, headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        # Fetch the bill and verify net_amount
        res2 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        found = [b for b in data2['bills'] if b['name'] == 'Hamali Test Kisan']
        self.assertEqual(len(found), 1)
        
        bill = found[0]
        gross = bill['no_of_bags'] * bill['price']  # 90 * 100 = 9000
        commission = round(gross * 0.04)  # 360
        hamali_deduction = bill['no_of_bags'] * bill['hamali']  # 90 * 5 = 450
        damage = round(gross * 0.06)  # 540
        expected_net = max(0.0, gross - commission - hamali_deduction - damage)  # 7650
        
        self.assertEqual(bill['net_amount'], expected_net, 
            f"Expected net_amount {expected_net}, got {bill['net_amount']}")

    def test_12_hamali_multi_channel_bill(self):
        """Test hamali for multi-channel bill: 30 bags (2 channels) + 40 bags (2nd channel) at ₹10/bag"""
        # Total 70 bags @ ₹200/bag = ₹14,000 gross
        # Hamali: ₹10 per bag = ₹700 total deduction
        # Commission: 4% of ₹14,000 = ₹560
        # Damage: 6% of ₹14,000 = ₹840
        # Net = 14000 - 560 - 700 - 840 = ₹11,900
        payload = {
            'name': 'Multi-Channel Kisan',
            'billdate': '2026-08-13',
            'items': [
                {'bags': 30, 'price': 200},
                {'bags': 40, 'price': 200}
            ],
            'hamali': 10,
            'advance': 0
        }
        res = self.client.post('/api/add-bill', json=payload, headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        # Fetch the bill and verify net_amount
        res2 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        found = [b for b in data2['bills'] if b['name'] == 'Multi-Channel Kisan']
        self.assertEqual(len(found), 1)
        
        bill = found[0]
        gross = bill['no_of_bags'] * bill['price']  # 70 * 200 = 14000
        commission = round(gross * 0.04)  # 560
        hamali_deduction = bill['no_of_bags'] * bill['hamali']  # 70 * 10 = 700
        damage = round(gross * 0.06)  # 840
        expected_net = max(0.0, gross - commission - hamali_deduction - damage)  # 11900
        
        self.assertEqual(bill['net_amount'], expected_net,
            f"Expected net_amount {expected_net}, got {bill['net_amount']}")

    def test_13_kisan_balance_paid_status(self):
        """Test PAID/NOT PAID status in Kisan Balance"""
        # Create two bills: one NOT PAID, one PAID
        res1 = self.client.post('/api/add-bill', json={
            'name': 'Status Test Kisan',
            'billdate': '2026-08-13',
            'no_of_bags': 50,
            'price': 100,
            'hamali': 5,
            'advance': 0
        }, headers=self.auth_headers)
        self.assertEqual(res1.status_code, 200)

        # Get the bill and confirm it to mark as PAID
        res2 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        bill = [b for b in data2['bills'] if b['name'] == 'Status Test Kisan'][0]
        bill_id = bill['id']

        # Confirm the bill (mark as PAID)
        res3 = self.client.post(f'/api/confirm-bill/{bill_id}', headers=self.auth_headers)
        self.assertEqual(res3.status_code, 200)

        # Verify paid status is YES
        res4 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data4 = json.loads(res4.data)
        confirmed_bill = [b for b in data4['bills'] if b['id'] == bill_id][0]
        self.assertEqual(confirmed_bill['paid'], 'YES')

    def test_14_invoice_hamali_deduction_15_bags(self):
        """Test invoice hamali deduction: 15 bags × ₹5/bag = ₹75 (not ₹5)
        
        Test case:
        - 15 bags @ ₹200/bag = ₹3,000 gross
        - Hamali: ₹5/bag = ₹75 total deduction
        - Commission: 4% of ₹3,000 = ₹120
        - Damage: 6% of ₹3,000 = ₹180
        - Net = 3000 - 120 - 75 - 180 = ₹2,625
        """
        payload = {
            'name': 'Invoice Hamali Test',
            'billdate': '2026-08-13',
            'no_of_bags': 15,
            'price': 200,
            'hamali': 5,
            'advance': 0
        }
        res = self.client.post('/api/add-bill', json=payload, headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        # Fetch the bill via API
        res2 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        found = [b for b in data2['bills'] if b['name'] == 'Invoice Hamali Test']
        self.assertEqual(len(found), 1)
        
        bill = found[0]
        
        # Verify bill returns per-bag hamali value
        self.assertEqual(bill['hamali'], 5, "Backend should return hamali as per-bag rate (5)")
        self.assertEqual(bill['no_of_bags'], 15, "Backend should return total bags (15)")
        
        # Verify calculations for invoice/receipt display (simulating frontend calculation)
        gross = bill['no_of_bags'] * bill['price']  # 15 * 200 = 3000
        hamali_per_bag = bill['hamali']  # 5
        hamali_deduction_for_invoice = hamali_per_bag * bill['no_of_bags']  # 5 * 15 = 75
        commission = round(gross * 0.04)  # 120
        damage = round(gross * 0.06)  # 180
        expected_net = max(0.0, gross - commission - hamali_deduction_for_invoice - damage)  # 2625
        
        # The backend net_amount should match this calculation
        self.assertEqual(bill['net_amount'], expected_net,
            f"Invoice net_amount should be {expected_net}, got {bill['net_amount']}")
        
        # Verify the invoice would display the correct hamali deduction
        self.assertEqual(hamali_deduction_for_invoice, 75,
            f"Invoice hamali deduction should be 75 (15 bags × ₹5), not {hamali_deduction_for_invoice}")

    def test_15_multi_channel_invoice_hamali(self):
        """Test multi-channel bill invoice with correct hamali calculation
        
        Test case:
        - Channel 1: 10 bags @ ₹150/bag = ₹1,500
        - Channel 2: 8 bags @ ₹150/bag = ₹1,200
        - Total: 18 bags, gross ₹2,700
        - Hamali: ₹10/bag = ₹180 total deduction (not ₹10)
        - Commission: 4% of ₹2,700 = ₹108
        - Damage: 6% of ₹2,700 = ₹162
        - Net = 2700 - 108 - 180 - 162 = ₹2,250
        """
        payload = {
            'name': 'Multi-Channel Invoice Test',
            'billdate': '2026-08-13',
            'items': [
                {'bags': 10, 'price': 150},
                {'bags': 8, 'price': 150}
            ],
            'hamali': 10,
            'advance': 0
        }
        res = self.client.post('/api/add-bill', json=payload, headers=self.auth_headers)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        # Fetch the bill via API
        res2 = self.client.get('/api/home-bills?date=2026-08-13', headers=self.auth_headers)
        data2 = json.loads(res2.data)
        found = [b for b in data2['bills'] if b['name'] == 'Multi-Channel Invoice Test']
        self.assertEqual(len(found), 1)
        
        bill = found[0]
        
        # Verify bill structure
        self.assertEqual(bill['no_of_bags'], 18, "Total bags should be 18")
        self.assertEqual(bill['hamali'], 10, "Hamali should be per-bag rate (10)")
        
        # Verify invoice display calculation
        gross = bill['no_of_bags'] * bill['price']  # 18 * 150 = 2700
        hamali_deduction_for_invoice = bill['hamali'] * bill['no_of_bags']  # 10 * 18 = 180
        commission = round(gross * 0.04)  # 108
        damage = round(gross * 0.06)  # 162
        expected_net = max(0.0, gross - commission - hamali_deduction_for_invoice - damage)  # 2250
        
        self.assertEqual(bill['net_amount'], expected_net,
            f"Invoice net_amount should be {expected_net}, got {bill['net_amount']}")
        
        self.assertEqual(hamali_deduction_for_invoice, 180,
            f"Invoice hamali deduction should be 180 (18 bags × ₹10), not {hamali_deduction_for_invoice}")

    # ------------------------------------------------------------------
    # Tests 16-25: Remaining Balance — kisan-balance and buyer-balance
    # ------------------------------------------------------------------

    def _add_buy_bill(self, name, bags, price, hamali, advance, date='2025-01-15'):
        """Helper: create a BUY bill and return the grouped bill object."""
        res = self.client.post('/api/add-bill', json={
            'name': name,
            'billdate': date,
            'no_of_bags': bags,
            'price': price,
            'hamali': hamali,
            'advance': advance,
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200, res.data)
        return json.loads(res.data)

    def _add_buyer_bill(self, name, bags, price, advance, date='2025-01-15'):
        """Helper: create a BUYER bill and return response data."""
        res = self.client.post('/api/add-buyer-bill', json={
            'name': name,
            'billdate': date,
            'items': [{'bags': bags, 'price': price}],
            'advance': advance,
        }, headers=self.auth_headers)
        self.assertEqual(res.status_code, 200, res.data)
        return json.loads(res.data)

    def _kisan_balance(self, name, year='2025'):
        res = self.client.get(
            f'/api/kisan-balance?name={name}&year={year}',
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        return data

    def _buyer_balance(self, name, year='2025'):
        res = self.client.get(
            f'/api/buyer-balance?name={name}&year={year}',
            headers=self.auth_headers,
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        return data

    # ---- helpers for expected values ----
    @staticmethod
    def _expected_net(bags, price, hamali_per_bag):
        gross = bags * price
        commission = round(gross * 0.04)
        damage = round(gross * 0.06)
        hamali = hamali_per_bag * bags
        return max(0.0, gross - commission - damage - hamali)

    # ---- kisan balance tests ----

    def test_16_kisan_balance_unpaid_no_advance(self):
        """Unpaid bill, zero advance → pending = net_amount, remaining > 0."""
        bags, price, hamali = 100, 50, 5
        expected_net = self._expected_net(bags, price, hamali)
        self._add_buy_bill('KB_Unpaid', bags, price, hamali, advance=0)

        data = self._kisan_balance('KB_Unpaid')
        records = data['records']
        self.assertEqual(len(records), 1)
        r = records[0]

        self.assertAlmostEqual(r['net_amount'], expected_net, places=2)
        self.assertAlmostEqual(r['pending_balance'], expected_net, places=2,
            msg='pending_balance must equal net_amount when advance=0')
        self.assertEqual(r['paid'], 'NO')
        self.assertAlmostEqual(data['summary']['pending_balance'], expected_net, places=2)

    def test_17_kisan_balance_partially_paid(self):
        """Partial advance → pending = net_amount − advance, remaining > 0."""
        bags, price, hamali = 100, 50, 5
        expected_net = self._expected_net(bags, price, hamali)
        advance = expected_net / 2          # pay exactly half
        self._add_buy_bill('KB_Partial', bags, price, hamali, advance=advance)

        data = self._kisan_balance('KB_Partial')
        r = data['records'][0]

        self.assertAlmostEqual(r['net_amount'], expected_net, places=2)
        self.assertAlmostEqual(r['advance'], advance, places=2)
        expected_pending = expected_net - advance
        self.assertAlmostEqual(r['pending_balance'], expected_pending, places=2,
            msg='pending_balance must be net − advance for partial payment')
        self.assertEqual(r['paid'], 'NO')

    def test_18_kisan_balance_fully_paid_via_advance(self):
        """Advance >= net_amount → pending = 0, paid = YES."""
        bags, price, hamali = 100, 50, 5
        expected_net = self._expected_net(bags, price, hamali)
        self._add_buy_bill('KB_FullAdvance', bags, price, hamali, advance=expected_net)

        data = self._kisan_balance('KB_FullAdvance')
        r = data['records'][0]

        self.assertAlmostEqual(r['net_amount'], expected_net, places=2)
        self.assertAlmostEqual(r['pending_balance'], 0.0, places=2,
            msg='pending_balance must be 0 when advance >= net_amount')
        self.assertEqual(r['paid'], 'YES')
        self.assertAlmostEqual(data['summary']['pending_balance'], 0.0, places=2)

    def test_19_kisan_balance_over_paid_no_negative(self):
        """Advance > net_amount (over-paid) → pending = 0, NOT negative."""
        bags, price, hamali = 100, 50, 5
        expected_net = self._expected_net(bags, price, hamali)
        over_advance = expected_net + 500   # pay ₹500 more than owed
        self._add_buy_bill('KB_OverPaid', bags, price, hamali, advance=over_advance)

        data = self._kisan_balance('KB_OverPaid')
        r = data['records'][0]

        self.assertGreaterEqual(r['pending_balance'], 0.0,
            msg='pending_balance must never be negative (over-payment)')
        self.assertAlmostEqual(r['pending_balance'], 0.0, places=2)
        self.assertEqual(r['paid'], 'YES')

    def test_20_kisan_balance_manually_marked_paid_zero_advance(self):
        """Bill manually marked paid (no advance) → pending = 0, status = YES."""
        self._add_buy_bill('KB_ManualPaid', 100, 50, 5, advance=0)

        # fetch the bill id
        res = self.client.get('/api/home-bills?date=2025-01-15', headers=self.auth_headers)
        bills = json.loads(res.data)['bills']
        bill = next(b for b in bills if b['name'] == 'KB_ManualPaid')

        # manually mark paid
        res2 = self.client.post(f'/api/mark-bill-paid/{bill["id"]}',
                                json={'paid': 'YES'}, headers=self.auth_headers)
        self.assertEqual(res2.status_code, 200)

        data = self._kisan_balance('KB_ManualPaid')
        r = data['records'][0]

        self.assertAlmostEqual(r['pending_balance'], 0.0, places=2,
            msg='pending_balance must be 0 when bill is manually marked paid')
        self.assertEqual(r['paid'], 'YES')

    def test_21_kisan_balance_summary_aggregates_multiple_bills(self):
        """Summary totals aggregate correctly across multiple bills."""
        bags, price, hamali = 50, 100, 10
        net = self._expected_net(bags, price, hamali)

        # Bill A: unpaid, Bill B: fully paid
        self._add_buy_bill('KB_SumTest', bags, price, hamali, advance=0,    date='2025-02-01')
        self._add_buy_bill('KB_SumTest', bags, price, hamali, advance=net,  date='2025-02-02')

        data = self._kisan_balance('KB_SumTest')
        self.assertEqual(len(data['records']), 2)

        summary = data['summary']
        self.assertAlmostEqual(summary['net_amount'], net * 2, places=2)
        # Only the unpaid bill contributes to pending
        self.assertAlmostEqual(summary['pending_balance'], net, places=2,
            msg='Summary pending should only include the unpaid bill')

    # ---- buyer balance tests ----

    def test_22_buyer_balance_unpaid_no_advance(self):
        """Buyer bill, no advance → pending = gross (no deductions for BUYER)."""
        bags, price = 80, 200
        gross = bags * price
        self._add_buyer_bill('BB_Unpaid', bags, price, advance=0)

        data = self._buyer_balance('BB_Unpaid')
        r = data['records'][0]

        self.assertAlmostEqual(r['net_amount'], gross, places=2,
            msg='BUYER net_amount = gross (no deductions)')
        self.assertAlmostEqual(r['pending_balance'], gross, places=2,
            msg='pending_balance = gross when advance=0')
        self.assertEqual(r['paid'], 'NO')

    def test_23_buyer_balance_partially_paid(self):
        """Buyer partial advance → pending = gross − advance."""
        bags, price = 80, 200
        gross = bags * price
        advance = gross / 2
        self._add_buyer_bill('BB_Partial', bags, price, advance=advance)

        data = self._buyer_balance('BB_Partial')
        r = data['records'][0]

        self.assertAlmostEqual(r['pending_balance'], gross - advance, places=2)
        self.assertEqual(r['paid'], 'NO')

    def test_24_buyer_balance_fully_paid(self):
        """Buyer advance >= gross → pending = 0, paid = YES."""
        bags, price = 80, 200
        gross = bags * price
        self._add_buyer_bill('BB_FullPaid', bags, price, advance=gross)

        data = self._buyer_balance('BB_FullPaid')
        r = data['records'][0]

        self.assertAlmostEqual(r['pending_balance'], 0.0, places=2)
        self.assertEqual(r['paid'], 'YES')

    def test_25_buyer_balance_over_paid_no_negative(self):
        """Buyer over-paid → pending = 0, NOT negative."""
        bags, price = 80, 200
        gross = bags * price
        self._add_buyer_bill('BB_OverPaid', bags, price, advance=gross + 1000)

        data = self._buyer_balance('BB_OverPaid')
        r = data['records'][0]

        self.assertGreaterEqual(r['pending_balance'], 0.0,
            msg='Buyer pending_balance must never be negative')
        self.assertAlmostEqual(r['pending_balance'], 0.0, places=2)
        self.assertEqual(r['paid'], 'YES')


if __name__ == '__main__':
    unittest.main()

