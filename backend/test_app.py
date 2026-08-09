import unittest
import json
import os
import db
import app as flask_app

class AgriCommissionManagerTestCase(unittest.TestCase):
    def setUp(self):
        # Set up test database in memory / local test instance
        db.DATABASE_URL = None
        db.init_db()
        self.app = flask_app.app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_01_auth_login_admin_success(self):
        res = self.client.post('/api/login', json={'username': 'admin', 'password': 'admin'})
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('user', data)

    def test_02_auth_login_invalid_password(self):
        res = self.client.post('/api/login', json={'username': 'admin', 'password': 'wrongpassword'})
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
        res = self.client.post('/api/add-bill', json=payload)
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])

        res2 = self.client.get('/api/home-bills?date=2026-08-09')
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
        })
        self.assertEqual(res.status_code, 200)

        res2 = self.client.get('/api/home-bills?date=2026-08-09')
        data2 = json.loads(res2.data)
        target = [b for b in data2['bills'] if b['name'] == 'Update Bill Kisan'][0]
        bill_id = target['id']

        res_confirm = self.client.post(f'/api/confirm-bill/{bill_id}')
        self.assertEqual(res_confirm.status_code, 200)

        res3 = self.client.get('/api/home-bills?date=2026-08-09')
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
        })
        self.assertEqual(res_update.status_code, 200)

        res4 = self.client.get('/api/home-bills?date=2026-08-09')
        data4 = json.loads(res4.data)
        updated_bill = [b for b in data4['bills'] if b['id'] == bill_id][0]
        self.assertEqual(updated_bill['paid'], 'NO')

    def test_06_advance_single_and_multi_creation(self):
        res = self.client.post('/api/advance', json={
            'name': 'SSL',
            'date': '2026-08-09',
            'amount': 5000
        })
        self.assertEqual(res.status_code, 200)

        res_multi = self.client.post('/api/add-multi-advance', json={
            'date': '2026-08-09',
            'advances': {
                'AVR': 3000,
                'BVS': 0,
                'DPR': 1500
            }
        })
        self.assertEqual(res_multi.status_code, 200)

        res_list = self.client.get('/api/advances?date=2026-08-09')
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
        res = self.client.post('/api/sold-data', json=payload)
        self.assertEqual(res.status_code, 200)

        res_get = self.client.get('/api/sold-data?date=2026-08-09')
        data_get = json.loads(res_get.data)
        self.assertTrue(data_get['success'])
        self.assertGreater(len(data_get['sold_data']), 0)

    def test_08_buyer_balance_report(self):
        res = self.client.post('/api/add-buyer-bill', json={
            'name': 'Super Buyer',
            'billdate': '2026-08-09',
            'items': [{'bags': 20, 'price': 1000}],
            'advance': 5000
        })
        self.assertEqual(res.status_code, 200)

        res_bal = self.client.get('/api/buyer-balance?year=2026')
        data_bal = json.loads(res_bal.data)
        self.assertTrue(data_bal['success'])
        self.assertIn('summary', data_bal)
        self.assertGreater(data_bal['summary']['total_amount'], 0)

    def test_09_sms_formatting_generator(self):
        res = self.client.get('/api/sms-to-send?date=2026-08-09')
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertIn('sms_list', data)

    def test_10_account_linking_google_oauth_and_email_password(self):
        # Step A: Signup via Email/Password
        signup_res = self.client.post('/api/signup', json={
            'name': 'Supriya Garapati',
            'email': 'garapatisupriya26@gmail.com',
            'password': 'mypassword123'
        })
        signup_data = json.loads(signup_res.data)
        self.assertEqual(signup_res.status_code, 201)
        original_user_id = signup_data['user']['user_id']

        # Step B: Sign in via Google OAuth using UPPERCASE/MixedCase email
        google_res = self.client.post('/api/google-auth', json={
            'name': 'Supriya Garapati',
            'email': 'GarapatiSupriya26@gmail.com'
        })
        google_data = json.loads(google_res.data)
        self.assertEqual(google_res.status_code, 200)

        # Step C: VERIFY strictly unified user_id across sign-in methods!
        linked_user_id = google_data['user']['user_id']
        self.assertEqual(original_user_id, linked_user_id)
        self.assertEqual(google_data['user']['email'], 'garapatisupriya26@gmail.com')

if __name__ == '__main__':
    unittest.main()
