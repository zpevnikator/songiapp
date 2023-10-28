
magick  \
    -size 1000x1000  xc:transparent \
    -fill '#ddddfa' \
    -draw "circle 500 500 500 1" \
    -pointsize 400 -font './Mcbungus-Regular.ttf' \
    -gravity center \
    -fill '#0000ff' \
    -draw 'text 0,-150 "App"' \
    -fill '#3a3a3a' \
    -draw 'text 0,150 "Songi"' \
    icon_circle.png


magick  \
    -size 1000x1000  xc:transparent \
    -fill '#ddddfa' \
    -draw "rectangle 0,0 1000,1000" \
    -pointsize 400 -font './Mcbungus-Regular.ttf' \
    -gravity center \
    -fill '#0000ff' \
    -draw 'text 0,-150 "App"' \
    -fill '#3a3a3a' \
    -draw 'text 0,150 "Songi"' \
    icon_maskable.png


magick icon_maskable.png -resize 512x512! ../public/logo512.png
magick icon_maskable.png -resize 192x192! ../public/logo192.png
magick icon_circle.png -define icon:auto-resize="256,128,96,64,48,32,16" ../public/favicon.ico
