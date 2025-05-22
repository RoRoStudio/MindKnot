# run expo for expo go
npx expo start --tunnel

# export all .tsx and .ts code to all-codes.txt file
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" -not -path "./.pnp.*" \
  -exec sh -c 'for f do echo -e "\n\n// ==== $f ====\n"; cat "$f"; done' sh {} + \
  > all-code.txt
 
# use android emulator with expo
~/emulator.sh

(not needed mostly) emulator -avd Pixel_8_API_35

npx expo start --android

npx expo run:android (for sqlite)

# with clear cache
npx expo start -c

# find critical errors:
npx tsc --noEmit

# fix frozen emulator
#!/bin/bash
/mnt/c/Users/rober/AppData/Local/Android/Sdk/emulator/emulator.exe -avd Pixel_8_API_35 -no-snapshot-load -no-snapshot-save -wipe-data -gpu swiftshader_indirect

# not frozen
/mnt/c/Users/rober/AppData/Local/Android/Sdk/emulator/emulator.exe -avd Pixel_8_API_35 

then use this to make it executable:
chmod +x ~/emulator.sh

