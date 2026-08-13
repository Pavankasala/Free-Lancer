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

if __name__ == '__main__':
    unittest.main()

