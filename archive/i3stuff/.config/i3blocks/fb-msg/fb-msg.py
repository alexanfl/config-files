import facebook

fname = ".fb-token"

with open(fname) as f:
    content = f.readlines()

token = content[0]

graph = facebook.GraphAPI(token)
msg = graph.get_connections('me', 'inbox')
num_msg = msg['summary']['unread_count']


if num_msg == 0:
    print('<span color="#ffffff"><sup>%d</sup></span>' % num_msg)
else:
    print('<span color="#ff0000"><sup>%d</sup></span>' % num_msg)
