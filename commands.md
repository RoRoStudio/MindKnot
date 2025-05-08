# run expo for expo go
npx expo start --tunnel

# export all .tsx and .ts code to all-codes.txt file
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" -not -path "./.pnp.*" \
  -exec sh -c 'for f do echo -e "\n\n// ==== $f ====\n"; cat "$f"; done' sh {} + \
  > all-code.txt
 