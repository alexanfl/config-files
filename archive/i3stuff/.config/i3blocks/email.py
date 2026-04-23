import imaplib
import sys

# Username and password goes in this file:
fname = "/home/a/.em-pw"

with open(fname) as f:
    content = f.readlines()

username = content[0]
password = content[1]

# Login to INBOX
imap = imaplib.IMAP4_SSL("imap.gmail.com", 993)
imap.login(username, password)
imap.select('INBOX')

# Use search(), not status()
status, response = imap.search(None, 'UNSEEN')
unread_msg_nums = response[0].split()

# Print the count of all unread messages
emails = len(unread_msg_nums)
if emails == 0:
    print('<span color="#ffffff" font="FontAwesome">\uf0e0</span> <span color="#ffffff"><sup>%d</sup></span>' % emails)
else:
    print('<span color="#ffffff" font="FontAwesome">\uf0e0</span> <span color="#00ff00"><sup>%d</sup></span>' % emails)
