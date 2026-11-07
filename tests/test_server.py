"""Local integration tests with mocked providers; no real credentials are used."""
import http.client
import io
import json
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch
from http.server import ThreadingHTTPServer
import app

class SharedConfigTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old_path = app.CONFIG_PATH
        self.old_config = dict(app.CONFIG)
        app.CONFIG_PATH = Path(self.tmp.name) / 'private' / 'config.json'
        app.CONFIG.clear()
        app.CONFIG.update(provider='openai', model='test-model', api_key='')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), app.Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.upstream = []
        def fake(request, **kwargs):
            self.upstream.append(request)
            if request.full_url.endswith('/models'):
                return io.BytesIO(json.dumps({'data':[{'id':'test-model'},{'id':'gpt-4.1-mini'},{'id':'gpt-4o-mini'}]}).encode())
            payload=json.loads(request.data)
            text='["Read one section","Make brief notes","Review notes"]' if 'JSON array' in payload['messages'][0]['content'] else 'you got this ♡'
            return io.BytesIO(json.dumps({'choices':[{'message':{'content':text}}]}).encode())
        self.mock=patch('app.urllib.request.urlopen', side_effect=fake)
        self.mocked=self.mock.start()

    def tearDown(self):
        self.mock.stop()
        self.server.shutdown()
        self.server.server_close()
        app.CONFIG_PATH=self.old_path
        app.CONFIG.clear();app.CONFIG.update(self.old_config)
        self.tmp.cleanup()

    def request(self, path, data=None, lan=False):
        conn=http.client.HTTPConnection('127.0.0.1', self.server.server_port)
        headers={'Content-Type':'application/json'}
        if lan: headers['Host']='192.168.1.5:8000'
        conn.request('GET' if data is None else 'POST',path,None if data is None else json.dumps(data),headers)
        r=conn.getresponse(); result=r.status,json.loads(r.read());conn.close();return result

    def test_shared_save_reload_and_remote_chat_without_exposing_key(self):
        config={'provider':'deepseek','model':'test-model','api_key':'FAKE-UNIT-TEST-ONLY'}
        status,public=self.request('/api/config',config)
        self.assertEqual(status,200)
        self.assertNotIn('api_key',public)
        self.assertEqual(app.CONFIG_PATH.stat().st_mode & 0o777,0o600)
        self.assertEqual(app.load_config(),config)
        status,public=self.request('/api/config',lan=True)
        self.assertTrue(public['configured'])
        self.assertNotIn('api_key',public)
        status,result=self.request('/api/chat',{'message':"I'm stuck",'goal':'Read biology','history':[]},lan=True)
        self.assertEqual(status,200);self.assertEqual(result['mode'],'AI')
        request=self.upstream[-1]
        self.assertEqual(request.full_url,'https://api.deepseek.com/chat/completions')
        self.assertEqual(request.headers['Authorization'],'Bearer FAKE-UNIT-TEST-ONLY')
        self.assertEqual(json.loads(request.data)['model'],'test-model')
        self.assertEqual(self.request('/api/config',{'clear':True},lan=True)[0],403)
        self.assertTrue(self.request('/api/config')[1]['configured'])
        self.assertEqual(self.request('/api/config',{'clear':True})[0],200)
        self.assertFalse(self.request('/api/config')[1]['configured'])

    def test_auto_text_model_selection_and_no_vision_route(self):
        self.assertEqual(self.request('/api/config', {'auto':True,'api_key':'FAKE-UNIT-TEST-ONLY'},lan=True)[0],403)
        status,result=self.request('/api/config', {'auto':True,'api_key':'FAKE-UNIT-TEST-ONLY'})
        self.assertEqual(status,200);self.assertEqual(result['model'],'gpt-4.1-mini')
        self.assertNotIn('api_key',result);self.assertNotIn('vision',result)
        content=json.loads(self.upstream[-1].data)['messages'][0]['content']
        self.assertIsInstance(content,str);self.assertIn('text chat',content)
        before=len(self.upstream)
        self.assertEqual(self.request('/api/vision', {'consent':True,'image':'unused'},lan=True)[0],404)
        self.assertEqual(len(self.upstream),before)

    def test_auto_failure_preserves_existing_config(self):
        original=dict(app.CONFIG)
        self.mocked.side_effect=app.urllib.error.HTTPError('https://api.openai.com',401,'failure',{},None)
        status,result=self.request('/api/config', {'auto':True,'api_key':'FAKE-UNIT-TEST-ONLY'})
        self.assertEqual(status,502);self.assertEqual(app.CONFIG,original)
        self.mocked.side_effect=lambda *args,**kwargs: io.BytesIO(b'{"data":[{"id":"not-a-vision-model"}]}')
        self.assertEqual(self.request('/api/config', {'auto':True,'api_key':'FAKE-UNIT-TEST-ONLY'})[0],422)
        self.assertEqual(app.CONFIG,original)

    def test_task_completion_uses_goal_task_and_context(self):
        body={'message':'React to my completed study task.','event':'task_completed','task':'Read chapter 3','goal':'Revise biology','history':[{'role':'user','content':'I made notes'}]}
        status,data=self.request('/api/chat',body)
        self.assertEqual(status,200);self.assertEqual(data['mode'],'demo')
        self.request('/api/config',{'provider':'openai','model':'test-model','api_key':'FAKE-UNIT-TEST-ONLY'})
        status,data=self.request('/api/chat',body)
        self.assertEqual(status,200);self.assertEqual(data['mode'],'AI')
        messages=json.loads(self.upstream[-1].data)['messages']
        text=json.dumps(messages)
        for expected in ('Read chapter 3','Revise biology','I made notes','Do not merely say gg'):
            self.assertIn(expected,text)
        body['task']=''
        self.assertEqual(self.request('/api/chat',body)[0],400)

    def test_errors_and_encouragement(self):
        self.assertNotIn('?', app.reply("I'm stuck", [], 'Biology', api_key=''))
        self.assertIn('?', app.reply('Can you give me a hint?', [], 'Biology', api_key=''))
        self.assertEqual(self.request('/api/config', {'provider':'deepseek','model':'x'})[0],400)
        self.assertEqual(self.request('/api/models', {'provider':'openai'})[0],400)
        self.request('/api/config', {'provider':'openai','model':'test-model','api_key':'FAKE-UNIT-TEST-ONLY'})
        for code in (401,402,403,404,429):
            self.mocked.side_effect=app.urllib.error.HTTPError('https://api.openai.com',code,'failure',{},None)
            status,result=self.request('/api/chat',{'message':'hello'})
            self.assertEqual(status,502)
            self.assertEqual(result['upstream_status'],code)
            self.assertNotIn('FAKE',json.dumps(result))

    def test_task_plan_in_demo_and_shared_ai_mode(self):
        status,result=self.request('/api/plan',{'goal':'Read chapter 3'},lan=True)
        self.assertEqual(status,200);self.assertEqual(result['mode'],'demo');self.assertEqual(len(result['tasks']),3)
        self.request('/api/config',{'provider':'openai','model':'test-model','api_key':'FAKE-UNIT-TEST-ONLY'})
        status,result=self.request('/api/plan',{'goal':'Read chapter 3'},lan=True)
        self.assertEqual(status,200);self.assertEqual(result['mode'],'AI');self.assertEqual(result['tasks'][0],'Read one section')

if __name__=='__main__': unittest.main()
