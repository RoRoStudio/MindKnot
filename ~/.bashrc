# Fix for Cursor IDE terminal hanging issue
# Use minimal prompt in Cursor to avoid command detection issues
if [[ "$TERM_PROGRAM" == "vscode" ]]; then
  PS1='root@\h:\w\$ '
  RPROMPT=''
fi 