
function Draw-ArtCard {
    param([int]$type, [string]$bg, [string]$accent, [string]$outPath)
    $w = 520; $h = 560
    $dv = New-Object System.Windows.Media.DrawingVisual
    $dc = $dv.RenderOpen()

    # BG gradient
    $bgBrush = New-Object System.Windows.Media.LinearGradientBrush
    $bgBrush.StartPoint = New-Object System.Windows.Point 0, 0
    $bgBrush.EndPoint = New-Object System.Windows.Point 0, 1
    $bgBrush.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Colors]::White), 0.0))
    $bgBrush.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.ColorConverter]::ConvertFromString($bg)), 1.0))
    $dc.DrawRectangle($bgBrush, $null, (New-Object System.Windows.Rect 0, 0, $w, $h))

    # Center glow
    $glowBrush = New-Object System.Windows.Media.RadialGradientBrush
    $glowBrush.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Color]::FromArgb(100, 255, 255, 255)), 0.0))
    $glowBrush.GradientStops.Add((New-Object System.Windows.Media.GradientStop ([System.Windows.Media.Color]::FromArgb(0, 255, 255, 255)), 1.0))
    $dc.DrawEllipse($glowBrush, $null, (New-Object System.Windows.Point 260, 280), 200, 200)

    $dark = [System.Windows.Media.ColorConverter]::ConvertFromString("#1A1A2E")
    $accentColor = [System.Windows.Media.ColorConverter]::ConvertFromString($accent)
    $darkBrush = New-Object System.Windows.Media.SolidColorBrush $dark
    $accentBrush = New-Object System.Windows.Media.SolidColorBrush $accentColor
    $whiteBrush = [System.Windows.Media.Brushes]::White
    $pinkBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 150, 150))

    $op = New-Object System.Windows.Media.Pen $darkBrush, 7
    $op.StartLineCap = [System.Windows.Media.PenLineCap]::Round
    $op.EndLineCap = [System.Windows.Media.PenLineCap]::Round

    $star = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 213, 79))
    $starSmall = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 241, 118))

    function Draw-Star([System.Windows.Media.DrawingContext]$ctx, [double]$x, [double]$y, [double]$r) {
        $ctx.DrawEllipse($star, $null, (New-Object System.Windows.Point $x, $y), $r, $r)
        $ctx.DrawEllipse($starSmall, $null, (New-Object System.Windows.Point ($x - $r*0.3), ($y - $r*0.3)), $r*0.35, $r*0.35)
    }

    function Draw-WhiteStickerGlow([System.Windows.Media.DrawingContext]$ctx, [double]$cx, [double]$cy, [double]$rx, [double]$ry) {
        $wPen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 10
        $ctx.DrawEllipse($null, $wPen, (New-Object System.Windows.Point $cx, $cy), ($rx+5), ($ry+5))
    }

    function Draw-Eye([System.Windows.Media.DrawingContext]$ctx, [double]$x, [double]$y) {
        $ctx.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point $x, $y), 10, 14)
        $ctx.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point ($x-3), ($y-4)), 4, 5)
    }

    function Draw-Blush([System.Windows.Media.DrawingContext]$ctx, [double]$x, [double]$y) {
        $blush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromArgb(160, 255, 130, 120))
        $ctx.DrawEllipse($blush, $null, (New-Object System.Windows.Point $x, $y), 16, 10)
    }

    function Draw-SmilePen([System.Windows.Media.DrawingContext]$ctx, [double]$x1, [double]$y1, [double]$x2, [double]$y2) {
        $sp = New-Object System.Windows.Media.Pen $darkBrush, 5
        $sp.StartLineCap = [System.Windows.Media.PenLineCap]::Round
        $sp.EndLineCap = [System.Windows.Media.PenLineCap]::Round
        $pg = New-Object System.Windows.Media.PathGeometry
        $pf = New-Object System.Windows.Media.PathFigure
        $pf.StartPoint = New-Object System.Windows.Point $x1, $y1
        $pf.IsClosed = $false
        $arc = New-Object System.Windows.Media.ArcSegment
        $arc.Point = New-Object System.Windows.Point $x2, $y2
        $arc.Size = New-Object System.Windows.Size 20, 14
        $arc.SweepDirection = [System.Windows.Media.SweepDirection]::Counterclockwise
        $arc.IsLargeArc = $false
        $pf.Segments.Add($arc)
        $pg.Figures.Add($pf)
        $ctx.DrawGeometry($null, $sp, $pg)
    }

    switch ($type) {
        # 2: Nghe chép - Cute cat with quill + old radio
        2 {
            # Radio body
            $radioBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(139, 100, 70))
            $dc.DrawRoundedRectangle($radioBrush, $op, (New-Object System.Windows.Rect 155, 290, 210, 140), 20, 20)
            # Speaker grille
            $grilleBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 65, 40))
            $dc.DrawEllipse($grilleBrush, $op, (New-Object System.Windows.Point 220, 355), 35, 35)
            # Dial
            $dc.DrawEllipse($accentBrush, $op, (New-Object System.Windows.Point 310, 355), 22, 22)
            # Antenna
            $antPen = New-Object System.Windows.Media.Pen $darkBrush, 6
            $dc.DrawLine($antPen, (New-Object System.Windows.Point 340, 290), (New-Object System.Windows.Point 370, 200))
            $dc.DrawEllipse($accentBrush, $null, (New-Object System.Windows.Point 373, 196), 10, 10)
            # Cat
            $catBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 220, 185))
            # White sticker outline
            $wStickerPen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wStickerPen, (New-Object System.Windows.Point 230, 190), 72, 72)
            # Head
            $dc.DrawEllipse($catBrush, $op, (New-Object System.Windows.Point 230, 190), 68, 68)
            # Cat ears
            $pg1 = New-Object System.Windows.Media.PathGeometry
            $pf1 = New-Object System.Windows.Media.PathFigure; $pf1.StartPoint = New-Object System.Windows.Point 180, 145; $pf1.IsClosed = $true
            $pf1.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 165, 108), $true))
            $pf1.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 205, 130), $true))
            $pg1.Figures.Add($pf1); $dc.DrawGeometry($catBrush, $op, $pg1)
            $pg2 = New-Object System.Windows.Media.PathGeometry
            $pf2 = New-Object System.Windows.Media.PathFigure; $pf2.StartPoint = New-Object System.Windows.Point 280, 145; $pf2.IsClosed = $true
            $pf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 295, 108), $true))
            $pf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 255, 130), $true))
            $pg2.Figures.Add($pf2); $dc.DrawGeometry($catBrush, $op, $pg2)
            # Inner ear pink
            $pinkEarBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 180, 180))
            $pg3 = New-Object System.Windows.Media.PathGeometry
            $pf3 = New-Object System.Windows.Media.PathFigure; $pf3.StartPoint = New-Object System.Windows.Point 183, 142; $pf3.IsClosed = $true
            $pf3.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 172, 118), $true))
            $pf3.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 202, 134), $true))
            $pg3.Figures.Add($pf3); $dc.DrawGeometry($pinkEarBrush, $null, $pg3)
            $pg4 = New-Object System.Windows.Media.PathGeometry
            $pf4 = New-Object System.Windows.Media.PathFigure; $pf4.StartPoint = New-Object System.Windows.Point 277, 142; $pf4.IsClosed = $true
            $pf4.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 288, 118), $true))
            $pf4.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 258, 134), $true))
            $pg4.Figures.Add($pf4); $dc.DrawGeometry($pinkEarBrush, $null, $pg4)
            # Glasses
            $glassPen = New-Object System.Windows.Media.Pen $darkBrush, 4
            $dc.DrawEllipse($null, $glassPen, (New-Object System.Windows.Point 207, 182), 22, 18)
            $dc.DrawEllipse($null, $glassPen, (New-Object System.Windows.Point 253, 182), 22, 18)
            $dc.DrawLine($glassPen, (New-Object System.Windows.Point 229, 182), (New-Object System.Windows.Point 231, 182))
            Draw-Eye $dc 207 182; Draw-Eye $dc 253 182
            Draw-Blush $dc 190 203; Draw-Blush $dc 270 203
            Draw-SmilePen $dc 215 207 245 207
            # Quill pen
            $quillBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 180, 100))
            $qPen = New-Object System.Windows.Media.Pen $darkBrush, 4
            $dc.DrawLine((New-Object System.Windows.Media.Pen $quillBrush, 6), (New-Object System.Windows.Point 310, 160), (New-Object System.Windows.Point 350, 280))
            $dc.DrawEllipse($quillBrush, $qPen, (New-Object System.Windows.Point 310, 155), 15, 25)
            # Stars / notes
            Draw-Star $dc 100 160 12
            Draw-Star $dc 400 220 10
            Draw-Star $dc 380 380 9
            Draw-Star $dc 110 370 11
        }
        # 3: Nghe chọn từ - cute bunny + speaker + checkmark
        3 {
            # Speaker
            $spkBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(130, 90, 200))
            $pg = New-Object System.Windows.Media.PathGeometry
            $pf = New-Object System.Windows.Media.PathFigure; $pf.StartPoint = New-Object System.Windows.Point 290, 230; $pf.IsClosed = $true
            $pf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 350, 190), $true))
            $pf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 350, 350), $true))
            $pf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 290, 310), $true))
            $pg.Figures.Add($pf); $dc.DrawGeometry($spkBrush, $op, $pg)
            $dc.DrawRoundedRectangle($spkBrush, $op, (New-Object System.Windows.Rect 240, 240, 55, 60), 10, 10)
            # Sound waves
            $wavePen = New-Object System.Windows.Media.Pen $accentBrush, 7
            $wavePen.StartLineCap = [System.Windows.Media.PenLineCap]::Round
            $wavePen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $w1 = New-Object System.Windows.Media.PathGeometry
            $wf1 = New-Object System.Windows.Media.PathFigure; $wf1.StartPoint = New-Object System.Windows.Point 375, 240; $wf1.IsClosed = $false
            $a1 = New-Object System.Windows.Media.ArcSegment; $a1.Point = New-Object System.Windows.Point 375, 300; $a1.Size = New-Object System.Windows.Size 30, 40; $a1.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $wf1.Segments.Add($a1); $w1.Figures.Add($wf1); $dc.DrawGeometry($null, $wavePen, $w1)
            $w2 = New-Object System.Windows.Media.PathGeometry
            $wf2 = New-Object System.Windows.Media.PathFigure; $wf2.StartPoint = New-Object System.Windows.Point 400, 220; $wf2.IsClosed = $false
            $a2 = New-Object System.Windows.Media.ArcSegment; $a2.Point = New-Object System.Windows.Point 400, 320; $a2.Size = New-Object System.Windows.Size 50, 65; $a2.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $wf2.Segments.Add($a2); $w2.Figures.Add($wf2); $dc.DrawGeometry($null, $wavePen, $w2)
            # Checkmark bubble
            $ckBg = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 220, 130))
            $dc.DrawEllipse($ckBg, $op, (New-Object System.Windows.Point 165, 360), 46, 46)
            $ckPen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 9
            $ckPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $ckPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $ckg = New-Object System.Windows.Media.PathGeometry
            $ckf = New-Object System.Windows.Media.PathFigure; $ckf.StartPoint = New-Object System.Windows.Point 143, 360; $ckf.IsClosed = $false
            $ckf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 158, 378), $true))
            $ckf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 190, 342), $true))
            $ckg.Figures.Add($ckf); $dc.DrawGeometry($null, $ckPen, $ckg)
            # Bunny
            $bunBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 240, 240))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            # Long ears
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 185, 120), 25, 65)
            $dc.DrawEllipse($bunBrush, $op, (New-Object System.Windows.Point 185, 120), 25, 65)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 185, 120), 12, 50)
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 220, 125), 20, 55)
            $dc.DrawEllipse($bunBrush, $op, (New-Object System.Windows.Point 220, 125), 20, 55)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 220, 125), 10, 42)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 200, 230), 65, 65)
            $dc.DrawEllipse($bunBrush, $op, (New-Object System.Windows.Point 200, 230), 65, 65)
            Draw-Eye $dc 178 220; Draw-Eye $dc 222 220
            Draw-Blush $dc 160 242; Draw-Blush $dc 240 242
            Draw-SmilePen $dc 185 248 215 248
            Draw-Star $dc 100 150 11; Draw-Star $dc 420 160 10; Draw-Star $dc 110 420 10; Draw-Star $dc 400 440 9
        }
        # 4: Nghe câu - blue songbird + headphones + music notes
        4 {
            # Branch
            $branchPen = New-Object System.Windows.Media.Pen (New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 65, 30))), 12
            $branchPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $branchPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawLine($branchPen, (New-Object System.Windows.Point 130, 340), (New-Object System.Windows.Point 400, 340))
            # Leaves
            $leafBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 200, 100))
            for ($lx = 150; $lx -le 380; $lx += 50) {
                $dc.DrawEllipse($leafBrush, $null, (New-Object System.Windows.Point $lx, 325), 18, 10)
            }
            # Flower
            $flowerBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 180, 210))
            for ($fa = 0; $fa -lt 5; $fa++) {
                $ang = $fa * 72 * [Math]::PI / 180
                $fx = 350 + 15 * [Math]::Cos($ang)
                $fy = 320 + 15 * [Math]::Sin($ang)
                $dc.DrawEllipse($flowerBrush, $null, (New-Object System.Windows.Point $fx, $fy), 10, 7)
            }
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 50))), $null, (New-Object System.Windows.Point 350, 320), 8, 8)
            # Bird body
            $birdBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 170, 240))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 230, 240), 65, 55)
            $dc.DrawEllipse($birdBrush, $op, (New-Object System.Windows.Point 230, 240), 65, 55)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 230, 175), 50, 50)
            $dc.DrawEllipse($birdBrush, $op, (New-Object System.Windows.Point 230, 175), 50, 50)
            # Mini pink headphones
            $hpBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 150, 190))
            $hpArc = New-Object System.Windows.Media.PathGeometry
            $hpf = New-Object System.Windows.Media.PathFigure; $hpf.StartPoint = New-Object System.Windows.Point 185, 170; $hpf.IsClosed = $false
            $hpa = New-Object System.Windows.Media.ArcSegment; $hpa.Point = New-Object System.Windows.Point 275, 170; $hpa.Size = New-Object System.Windows.Size 48, 48; $hpa.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $hpf.Segments.Add($hpa); $hpArc.Figures.Add($hpf)
            $dc.DrawGeometry($null, (New-Object System.Windows.Media.Pen $hpBrush, 10), $hpArc)
            $dc.DrawEllipse($hpBrush, $op, (New-Object System.Windows.Point 185, 173), 14, 20)
            $dc.DrawEllipse($hpBrush, $op, (New-Object System.Windows.Point 275, 173), 14, 20)
            # Beak
            $beakBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 180, 60))
            $bpg = New-Object System.Windows.Media.PathGeometry
            $bpf = New-Object System.Windows.Media.PathFigure; $bpf.StartPoint = New-Object System.Windows.Point 250, 178; $bpf.IsClosed = $true
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 270, 184), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 250, 190), $true))
            $bpg.Figures.Add($bpf); $dc.DrawGeometry($beakBrush, $op, $bpg)
            Draw-Eye $dc 220 168; Draw-Eye $dc 240 168
            Draw-Blush $dc 200 190; Draw-Blush $dc 255 190
            # Music notes floating
            $notePen = New-Object System.Windows.Media.Pen $accentBrush, 5
            $dc.DrawEllipse($accentBrush, $null, (New-Object System.Windows.Point 310, 150), 14, 10)
            $dc.DrawLine($notePen, (New-Object System.Windows.Point 324, 148), (New-Object System.Windows.Point 324, 110))
            $dc.DrawEllipse($accentBrush, $null, (New-Object System.Windows.Point 350, 130), 12, 9)
            $dc.DrawLine($notePen, (New-Object System.Windows.Point 362, 128), (New-Object System.Windows.Point 362, 93))
            $dc.DrawLine($notePen, (New-Object System.Windows.Point 324, 110), (New-Object System.Windows.Point 362, 93))
            Draw-Star $dc 110 160 11; Draw-Star $dc 400 300 10; Draw-Star $dc 120 400 9
        }
        # 5: Nói từ - colorful parrot + retro microphone
        5 {
            # Mic stand + base
            $micBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(190, 190, 200))
            $dc.DrawLine((New-Object System.Windows.Media.Pen $micBrush, 12), (New-Object System.Windows.Point 330, 300), (New-Object System.Windows.Point 330, 420))
            $dc.DrawRoundedRectangle($micBrush, $op, (New-Object System.Windows.Rect 285, 420, 90, 25), 12, 12)
            # Mic head
            $dc.DrawRoundedRectangle($micBrush, $op, (New-Object System.Windows.Rect 300, 185, 60, 125), 30, 30)
            $micGridPen = New-Object System.Windows.Media.Pen $darkBrush, 3
            $dc.DrawLine($micGridPen, (New-Object System.Windows.Point 302, 248), (New-Object System.Windows.Point 358, 248))
            $dc.DrawLine($micGridPen, (New-Object System.Windows.Point 330, 193), (New-Object System.Windows.Point 330, 303))
            # Parrot body
            $parrotBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 210, 120))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 185, 300), 60, 75)
            $dc.DrawEllipse($parrotBrush, $op, (New-Object System.Windows.Point 185, 300), 60, 75)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 185, 190), 58, 58)
            $dc.DrawEllipse($parrotBrush, $op, (New-Object System.Windows.Point 185, 190), 58, 58)
            # Wing accent
            $wingBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(60, 180, 240))
            $dc.DrawEllipse($wingBrush, $op, (New-Object System.Windows.Point 150, 310), 25, 50)
            $dc.DrawEllipse($wingBrush, $op, (New-Object System.Windows.Point 220, 310), 25, 50)
            # Beak
            $beakBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 165, 30))
            $bpg = New-Object System.Windows.Media.PathGeometry
            $bpf = New-Object System.Windows.Media.PathFigure; $bpf.StartPoint = New-Object System.Windows.Point 185, 192; $bpf.IsClosed = $true
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 220, 198), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 215, 215), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 200, 220), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 185, 212), $true))
            $bpg.Figures.Add($bpf); $dc.DrawGeometry($beakBrush, $op, $bpg)
            # Red forehead patch
            $redBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 80, 80))
            $dc.DrawEllipse($redBrush, $null, (New-Object System.Windows.Point 185, 148), 25, 20)
            Draw-Eye $dc 165 177; Draw-Eye $dc 205 177
            Draw-Blush $dc 148 200; Draw-Blush $dc 222 200
            # Speech sparkles
            Draw-Star $dc 90 150 12; Draw-Star $dc 390 160 11; Draw-Star $dc 120 390 10; Draw-Star $dc 400 400 9
        }
        # 6: Nói câu - panda + fox chat
        6 {
            # Fox (right)
            $foxBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(240, 140, 60))
            $wPen10 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 10
            # Fox ears
            $fpg1 = New-Object System.Windows.Media.PathGeometry
            $fpf1 = New-Object System.Windows.Media.PathFigure; $fpf1.StartPoint = New-Object System.Windows.Point 310, 180; $fpf1.IsClosed = $true
            $fpf1.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 295, 148), $true))
            $fpf1.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 328, 160), $true))
            $fpg1.Figures.Add($fpf1); $dc.DrawGeometry($foxBrush, $op, $fpg1)
            $fpg2 = New-Object System.Windows.Media.PathGeometry
            $fpf2 = New-Object System.Windows.Media.PathFigure; $fpf2.StartPoint = New-Object System.Windows.Point 360, 180; $fpf2.IsClosed = $true
            $fpf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 375, 148), $true))
            $fpf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 342, 160), $true))
            $fpg2.Figures.Add($fpf2); $dc.DrawGeometry($foxBrush, $op, $fpg2)
            $dc.DrawEllipse($null, $wPen10, (New-Object System.Windows.Point 335, 220), 55, 55)
            $dc.DrawEllipse($foxBrush, $op, (New-Object System.Windows.Point 335, 220), 55, 55)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 210))), $null, (New-Object System.Windows.Point 335, 230), 30, 25)
            Draw-Eye $dc 318 210; Draw-Eye $dc 352 210
            Draw-Blush $dc 300 228; Draw-Blush $dc 365 228
            Draw-SmilePen $dc 322 232 348 232
            # Panda (left)
            $pandaBrush = [System.Windows.Media.Brushes]::White
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 185, 310), 65, 65)
            $dc.DrawEllipse($pandaBrush, $op, (New-Object System.Windows.Point 185, 310), 65, 65)
            # Panda ears
            $pandaBlack = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(40, 40, 40))
            $dc.DrawEllipse($pandaBlack, $op, (New-Object System.Windows.Point 143, 262), 22, 22)
            $dc.DrawEllipse($pandaBlack, $op, (New-Object System.Windows.Point 227, 262), 22, 22)
            # Eye patches
            $dc.DrawEllipse($pandaBlack, $null, (New-Object System.Windows.Point 162, 300), 22, 18)
            $dc.DrawEllipse($pandaBlack, $null, (New-Object System.Windows.Point 208, 300), 22, 18)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 162, 300), 10, 14)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 208, 300), 10, 14)
            Draw-Eye $dc 162 300; Draw-Eye $dc 208 300
            Draw-Blush $dc 142 320; Draw-Blush $dc 228 320
            Draw-SmilePen $dc 170 328 200 328
            # Speech bubbles
            $sb1Brush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 240, 255))
            $dc.DrawRoundedRectangle($sb1Brush, $op, (New-Object System.Windows.Rect 215, 160, 95, 65), 18, 18)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 180, 60))), $null, (New-Object System.Windows.Point 240, 193), 10, 10)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 100, 130))), $null, (New-Object System.Windows.Point 262, 193), 8, 8)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 220, 130))), $null, (New-Object System.Windows.Point 282, 193), 9, 9)
            $sb2Brush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 240, 220))
            $dc.DrawRoundedRectangle($sb2Brush, $op, (New-Object System.Windows.Rect 215, 390, 95, 65), 18, 18)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 100, 130))), $null, (New-Object System.Windows.Point 240, 423), 10, 10)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 180, 255))), $null, (New-Object System.Windows.Point 262, 423), 9, 9)
            Draw-Star $dc 110 180 11; Draw-Star $dc 410 350 10
        }
        # 7: Đọc to - lion cub + megaphone
        7 {
            # Lion mane
            $maneBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 140, 40))
            $dc.DrawEllipse($maneBrush, $op, (New-Object System.Windows.Point 220, 220), 90, 90)
            # Lion head
            $lionBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 120))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 220, 215), 70, 70)
            $dc.DrawEllipse($lionBrush, $op, (New-Object System.Windows.Point 220, 215), 70, 70)
            # Ears
            $dc.DrawEllipse($maneBrush, $op, (New-Object System.Windows.Point 165, 165), 20, 20)
            $dc.DrawEllipse($maneBrush, $op, (New-Object System.Windows.Point 275, 165), 20, 20)
            $dc.DrawEllipse($lionBrush, $null, (New-Object System.Windows.Point 165, 165), 12, 12)
            $dc.DrawEllipse($lionBrush, $null, (New-Object System.Windows.Point 275, 165), 12, 12)
            # Nose + muzzle
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 190))), $op, (New-Object System.Windows.Point 220, 232), 32, 22)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 100, 80))), $null, (New-Object System.Windows.Point 220, 224), 10, 7)
            Draw-Eye $dc 197 203; Draw-Eye $dc 243 203
            Draw-Blush $dc 178 228; Draw-Blush $dc 262 228
            Draw-SmilePen $dc 205 244 235 244
            # Megaphone
            $mpBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 210, 120))
            $goldBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 50))
            $mpg = New-Object System.Windows.Media.PathGeometry
            $mpf = New-Object System.Windows.Media.PathFigure; $mpf.StartPoint = New-Object System.Windows.Point 280, 310; $mpf.IsClosed = $true
            $mpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 400, 270), $true))
            $mpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 400, 420), $true))
            $mpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 280, 380), $true))
            $mpg.Figures.Add($mpf); $dc.DrawGeometry($mpBrush, $op, $mpg)
            $dc.DrawRoundedRectangle($goldBrush, $op, (New-Object System.Windows.Rect 230, 310, 55, 70), 10, 10)
            # Sound waves
            $swPen = New-Object System.Windows.Media.Pen $accentBrush, 8
            $swPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $swPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            Draw-Star $dc 420, 240 15; Draw-Star $dc 440 310 18; Draw-Star $dc 420 390 14
            Draw-Star $dc 100 160 11; Draw-Star $dc 100 420 10
        }
        # 8: Phản xạ nói - cheetah + stopwatch
        8 {
            # Speed lines
            $slPen = New-Object System.Windows.Media.Pen $accentBrush, 6
            $slPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $slPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawLine($slPen, (New-Object System.Windows.Point 80, 250), (New-Object System.Windows.Point 150, 250))
            $dc.DrawLine($slPen, (New-Object System.Windows.Point 60, 290), (New-Object System.Windows.Point 140, 290))
            $dc.DrawLine($slPen, (New-Object System.Windows.Point 80, 330), (New-Object System.Windows.Point 155, 330))
            # Stopwatch
            $swBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 50))
            $dc.DrawEllipse($swBrush, $op, (New-Object System.Windows.Point 350, 200), 65, 65)
            $dc.DrawEllipse($null, $op, (New-Object System.Windows.Point 350, 200), 65, 65)
            # Clock hands
            $handPen = New-Object System.Windows.Media.Pen $darkBrush, 6
            $handPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $handPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawLine($handPen, (New-Object System.Windows.Point 350, 200), (New-Object System.Windows.Point 350, 155))
            $dc.DrawLine($handPen, (New-Object System.Windows.Point 350, 200), (New-Object System.Windows.Point 390, 215))
            $dc.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point 350, 200), 7, 7)
            # Crown button
            $dc.DrawRoundedRectangle($darkBrush, $null, (New-Object System.Windows.Rect 340, 130, 20, 15), 6, 6)
            # Cheetah
            $cheetBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 100))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 215, 300), 70, 70)
            $dc.DrawEllipse($cheetBrush, $op, (New-Object System.Windows.Point 215, 300), 70, 70)
            # Spots
            $spotBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 60, 20))
            $dc.DrawEllipse($spotBrush, $null, (New-Object System.Windows.Point 190, 275), 8, 6)
            $dc.DrawEllipse($spotBrush, $null, (New-Object System.Windows.Point 240, 270), 7, 5)
            $dc.DrawEllipse($spotBrush, $null, (New-Object System.Windows.Point 180, 310), 7, 5)
            $dc.DrawEllipse($spotBrush, $null, (New-Object System.Windows.Point 250, 320), 8, 6)
            # Ears
            $epg = New-Object System.Windows.Media.PathGeometry
            $epf = New-Object System.Windows.Media.PathFigure; $epf.StartPoint = New-Object System.Windows.Point 165, 248; $epf.IsClosed = $true
            $epf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 150, 220), $true))
            $epf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 185, 232), $true))
            $epg.Figures.Add($epf); $dc.DrawGeometry($cheetBrush, $op, $epg)
            $epg2 = New-Object System.Windows.Media.PathGeometry
            $epf2 = New-Object System.Windows.Media.PathFigure; $epf2.StartPoint = New-Object System.Windows.Point 265, 248; $epf2.IsClosed = $true
            $epf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 280, 220), $true))
            $epf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 245, 232), $true))
            $epg2.Figures.Add($epf2); $dc.DrawGeometry($cheetBrush, $op, $epg2)
            # Muzzle
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 240, 200))), $op, (New-Object System.Windows.Point 215, 316), 32, 22)
            Draw-Eye $dc 193 290; Draw-Eye $dc 237 290
            Draw-Blush $dc 173 315; Draw-Blush $dc 257 315
            # Sneakers hint
            $sneakBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 80, 80))
            $dc.DrawRoundedRectangle($sneakBrush, $op, (New-Object System.Windows.Rect 155, 400, 65, 35), 10, 18)
            $dc.DrawRoundedRectangle($sneakBrush, $op, (New-Object System.Windows.Rect 240, 400, 65, 35), 10, 18)
            Draw-Star $dc 110 160 12; Draw-Star $dc 410 410 10
        }
        # 9: Ngữ pháp - owl + wand + spellbook
        9 {
            # Book open
            $bookBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 240, 255))
            $bpg = New-Object System.Windows.Media.PathGeometry
            $bpf = New-Object System.Windows.Media.PathFigure; $bpf.StartPoint = New-Object System.Windows.Point 260, 400; $bpf.IsClosed = $true
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 130, 380), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 130, 300), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 260, 330), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 390, 300), $true))
            $bpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 390, 380), $true))
            $bpg.Figures.Add($bpf); $dc.DrawGeometry($bookBrush, $op, $bpg)
            $dc.DrawLine($op, (New-Object System.Windows.Point 260, 330), (New-Object System.Windows.Point 260, 400))
            # Stars on book
            Draw-Star $dc 180 350 9; Draw-Star $dc 330 345 9
            # Owl body
            $owlBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(140, 100, 60))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 230, 230), 60, 75)
            $dc.DrawEllipse($owlBrush, $op, (New-Object System.Windows.Point 230, 230), 60, 75)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 190, 150))), $op, (New-Object System.Windows.Point 230, 240), 40, 50)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 230, 148), 55, 55)
            $dc.DrawEllipse($owlBrush, $op, (New-Object System.Windows.Point 230, 148), 55, 55)
            # Ear tufts
            $ttPg = New-Object System.Windows.Media.PathGeometry
            $ttPf = New-Object System.Windows.Media.PathFigure; $ttPf.StartPoint = New-Object System.Windows.Point 190, 108; $ttPf.IsClosed = $true
            $ttPf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 183, 85), $true))
            $ttPf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 207, 100), $true))
            $ttPg.Figures.Add($ttPf); $dc.DrawGeometry($owlBrush, $op, $ttPg)
            $ttPg2 = New-Object System.Windows.Media.PathGeometry
            $ttPf2 = New-Object System.Windows.Media.PathFigure; $ttPf2.StartPoint = New-Object System.Windows.Point 270, 108; $ttPf2.IsClosed = $true
            $ttPf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 277, 85), $true))
            $ttPf2.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 253, 100), $true))
            $ttPg2.Figures.Add($ttPf2); $dc.DrawGeometry($owlBrush, $op, $ttPg2)
            # Graduation cap
            $capBrush = $darkBrush
            $dc.DrawRoundedRectangle($capBrush, $null, (New-Object System.Windows.Rect 185, 100, 90, 18), 4, 4)
            $dc.DrawRoundedRectangle($capBrush, $null, (New-Object System.Windows.Rect 215, 85, 30, 18), 4, 4)
            # Glasses
            $gp = New-Object System.Windows.Media.Pen $darkBrush, 4
            $dc.DrawEllipse($null, $gp, (New-Object System.Windows.Point 207, 148), 24, 20)
            $dc.DrawEllipse($null, $gp, (New-Object System.Windows.Point 253, 148), 24, 20)
            $dc.DrawLine($gp, (New-Object System.Windows.Point 231, 148), (New-Object System.Windows.Point 229, 148))
            Draw-Eye $dc 207 148; Draw-Eye $dc 253 148
            Draw-Blush $dc 185 170; Draw-Blush $dc 275 170
            Draw-SmilePen $dc 215 172 245 172
            # Magic wand
            $wgPen = New-Object System.Windows.Media.Pen $darkBrush, 6
            $dc.DrawLine($wgPen, (New-Object System.Windows.Point 310, 160), (New-Object System.Windows.Point 400, 90))
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 50))), $op, (New-Object System.Windows.Point 400, 90), 18, 18)
            Draw-Star $dc 100 160 11; Draw-Star $dc 410 300 10; Draw-Star $dc 400 410 9
        }
        # 10: Điền từ - squirrel + puzzle
        10 {
            # Puzzle board
            $pzBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 230, 255))
            $dc.DrawRoundedRectangle($pzBrush, $op, (New-Object System.Windows.Rect 150, 290, 220, 190), 16, 16)
            # Puzzle cells
            $gPen = New-Object System.Windows.Media.Pen $darkBrush, 3
            $dc.DrawLine($gPen, (New-Object System.Windows.Point 260, 290), (New-Object System.Windows.Point 260, 480))
            $dc.DrawLine($gPen, (New-Object System.Windows.Point 150, 385), (New-Object System.Windows.Point 370, 385))
            # Golden piece (fitting in)
            $pzGold = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 50))
            $dc.DrawRoundedRectangle($pzGold, $op, (New-Object System.Windows.Rect 265, 290, 100, 90), 10, 10)
            # Squirrel
            $sqBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(200, 130, 60))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            # Fluffy tail
            $tpg = New-Object System.Windows.Media.PathGeometry
            $tpf = New-Object System.Windows.Media.PathFigure; $tpf.StartPoint = New-Object System.Windows.Point 310, 240; $tpf.IsClosed = $false
            $a = New-Object System.Windows.Media.ArcSegment; $a.Point = New-Object System.Windows.Point 400, 150; $a.Size = New-Object System.Windows.Size 70, 80; $a.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $tpf.Segments.Add($a); $tpg.Figures.Add($tpf)
            $tailPen = New-Object System.Windows.Media.Pen $sqBrush, 32
            $tailPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $tailPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawGeometry($null, $tailPen, $tpg)
            # Body
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 215, 250), 55, 65)
            $dc.DrawEllipse($sqBrush, $op, (New-Object System.Windows.Point 215, 250), 55, 65)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 215, 165), 52, 52)
            $dc.DrawEllipse($sqBrush, $op, (New-Object System.Windows.Point 215, 165), 52, 52)
            # Ears
            $dc.DrawEllipse($sqBrush, $op, (New-Object System.Windows.Point 180, 125), 18, 20)
            $dc.DrawEllipse($sqBrush, $op, (New-Object System.Windows.Point 250, 125), 18, 20)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 180, 125), 10, 12)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 250, 125), 10, 12)
            # Muzzle
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 190))), $op, (New-Object System.Windows.Point 215, 182), 28, 20)
            Draw-Eye $dc 195 158; Draw-Eye $dc 235 158
            Draw-Blush $dc 178 180; Draw-Blush $dc 252 180
            Draw-SmilePen $dc 203 190 227 190
            Draw-Star $dc 100 160 11; Draw-Star $dc 100 420 10; Draw-Star $dc 410 420 10
        }
        # 11: Đúng/Sai - teddy referee + shield
        11 {
            # Shield
            $shBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 200, 240))
            $shpg = New-Object System.Windows.Media.PathGeometry
            $shpf = New-Object System.Windows.Media.PathFigure; $shpf.StartPoint = New-Object System.Windows.Point 310, 150; $shpf.IsClosed = $true
            $shpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 400, 175), $true))
            $shpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 400, 300), $true))
            $arc1 = New-Object System.Windows.Media.ArcSegment; $arc1.Point = New-Object System.Windows.Point 310, 390; $arc1.Size = New-Object System.Windows.Size 90, 90; $arc1.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $shpf.Segments.Add($arc1)
            $arc2 = New-Object System.Windows.Media.ArcSegment; $arc2.Point = New-Object System.Windows.Point 220, 300; $arc2.Size = New-Object System.Windows.Size 90, 90; $arc2.SweepDirection = [System.Windows.Media.SweepDirection]::Clockwise
            $shpf.Segments.Add($arc2)
            $shpf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 220, 175), $true))
            $shpg.Figures.Add($shpf); $dc.DrawGeometry($shBrush, $op, $shpg)
            # Big checkmark on shield
            $ckPen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 14
            $ckPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $ckPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $ckg = New-Object System.Windows.Media.PathGeometry
            $ckf = New-Object System.Windows.Media.PathFigure; $ckf.StartPoint = New-Object System.Windows.Point 250, 270; $ckf.IsClosed = $false
            $ckf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 300, 320), $true))
            $ckf.Segments.Add((New-Object System.Windows.Media.LineSegment (New-Object System.Windows.Point 375, 215), $true))
            $ckg.Figures.Add($ckf); $dc.DrawGeometry($null, $ckPen, $ckg)
            # Teddy
            $tedBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(200, 155, 100))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 180, 310), 65, 65)
            $dc.DrawEllipse($tedBrush, $op, (New-Object System.Windows.Point 180, 310), 65, 65)
            $dc.DrawEllipse($tedBrush, $op, (New-Object System.Windows.Point 135, 265), 20, 20)
            $dc.DrawEllipse($tedBrush, $op, (New-Object System.Windows.Point 225, 265), 20, 20)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(230, 190, 140))), $op, (New-Object System.Windows.Point 180, 325), 32, 24)
            # Ref shirt stripes
            $stripePen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::Black), 4
            $dc.DrawLine($stripePen, (New-Object System.Windows.Point 150, 360), (New-Object System.Windows.Point 210, 360))
            $dc.DrawLine($stripePen, (New-Object System.Windows.Point 145, 380), (New-Object System.Windows.Point 215, 380))
            Draw-Eye $dc 162 302; Draw-Eye $dc 198 302
            Draw-Blush $dc 142 320; Draw-Blush $dc 218 320
            Draw-SmilePen $dc 168 334 193 334
            Draw-Star $dc 110 160 12; Draw-Star $dc 100 440 10; Draw-Star $dc 410 440 9
        }
        # 12: Đoán nghĩa - detective puppy + magnifier
        12 {
            # Magnifier handle
            $mhPen = New-Object System.Windows.Media.Pen (New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(140, 90, 40))), 20
            $mhPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $mhPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawLine($mhPen, (New-Object System.Windows.Point 320, 350), (New-Object System.Windows.Point 420, 450))
            # Lens
            $lensBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(200, 230, 255))
            $dc.DrawEllipse($lensBrush, (New-Object System.Windows.Media.Pen $darkBrush, 16), (New-Object System.Windows.Point 270, 290), 85, 85)
            # Clue sparkle inside lens
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 50))), $null, (New-Object System.Windows.Point 270, 290), 30, 30)
            Draw-Star $dc 270 290 42
            # Puppy detective
            $pupBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 180, 120))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            # Body w coat
            $coatBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 200, 160))
            $dc.DrawRoundedRectangle($coatBrush, $op, (New-Object System.Windows.Rect 155, 290, 90, 120), 20, 20)
            # Head
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 200, 200), 65, 65)
            $dc.DrawEllipse($pupBrush, $op, (New-Object System.Windows.Point 200, 200), 65, 65)
            # Floppy ears
            $earBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(190, 140, 80))
            $dc.DrawEllipse($earBrush, $op, (New-Object System.Windows.Point 150, 220), 22, 44)
            $dc.DrawEllipse($earBrush, $op, (New-Object System.Windows.Point 250, 220), 22, 44)
            # Hat
            $hatBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(180, 155, 110))
            $dc.DrawRoundedRectangle($hatBrush, $op, (New-Object System.Windows.Rect 150, 128, 100, 55), 12, 12)
            $dc.DrawRoundedRectangle($hatBrush, $op, (New-Object System.Windows.Rect 135, 183, 130, 18), 6, 6)
            # Muzzle + nose
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 190))), $op, (New-Object System.Windows.Point 200, 218), 32, 22)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 60, 60))), $null, (New-Object System.Windows.Point 200, 210), 10, 7)
            Draw-Eye $dc 178 196; Draw-Eye $dc 222 196
            Draw-Blush $dc 162 220; Draw-Blush $dc 238 220
            Draw-SmilePen $dc 187 232 213 232
            Draw-Star $dc 100 150 12; Draw-Star $dc 410 160 11; Draw-Star $dc 100 440 10
        }
        # 13: Hoàn thành câu - hamster writing notebook
        13 {
            # Notebook
            $nbBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 250, 220))
            $dc.DrawRoundedRectangle($nbBrush, $op, (New-Object System.Windows.Rect 155, 240, 220, 240), 18, 18)
            # Spine
            $dc.DrawRoundedRectangle($accentBrush, $op, (New-Object System.Windows.Rect 150, 240, 20, 240), 10, 10)
            # Ruled lines
            $rPen = New-Object System.Windows.Media.Pen $accentBrush, 3
            for ($ry = 290; $ry -le 450; $ry += 30) {
                $dc.DrawLine($rPen, (New-Object System.Windows.Point 185, $ry), (New-Object System.Windows.Point 350, $ry))
            }
            # Sticker decoration
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 100, 130))), $null, (New-Object System.Windows.Point 345, 265), 16, 16)
            # Hamster
            $hamBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 160))
            $wPen12 = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 12
            # Chubby cheek pouches
            $dc.DrawEllipse($null, $wPen12, (New-Object System.Windows.Point 215, 155), 80, 70)
            $dc.DrawEllipse($hamBrush, $op, (New-Object System.Windows.Point 215, 155), 80, 70)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 200))), $op, (New-Object System.Windows.Point 180, 160), 30, 28)
            $dc.DrawEllipse((New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 230, 200))), $op, (New-Object System.Windows.Point 250, 160), 30, 28)
            # Ears
            $dc.DrawEllipse($hamBrush, $op, (New-Object System.Windows.Point 165, 108), 20, 20)
            $dc.DrawEllipse($hamBrush, $op, (New-Object System.Windows.Point 265, 108), 20, 20)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 165, 108), 12, 12)
            $dc.DrawEllipse($pinkBrush, $null, (New-Object System.Windows.Point 265, 108), 12, 12)
            Draw-Eye $dc 193 148; Draw-Eye $dc 237 148
            Draw-Blush $dc 173 168; Draw-Blush $dc 257 168
            Draw-SmilePen $dc 203 175 227 175
            # Golden pen in hand
            $penBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 215, 50))
            $penPen = New-Object System.Windows.Media.Pen $darkBrush, 5
            $dc.DrawLine((New-Object System.Windows.Media.Pen $penBrush, 10), (New-Object System.Windows.Point 310, 190), (New-Object System.Windows.Point 350, 280))
            $dc.DrawEllipse($penBrush, $penPen, (New-Object System.Windows.Point 310, 185), 12, 20)
            Draw-Star $dc 100 150 11; Draw-Star $dc 400 180 11; Draw-Star $dc 410 440 10
        }
        # 14: Sắp xếp câu - word blocks puzzle
        14 {
            # 4 colorful word blocks
            $colors = @("#FF8A80", "#FFD54F", "#80D8FF", "#CE93D8")
            $bxs = @(135, 240, 135, 240)
            $bys = @(230, 185, 355, 310)
            for ($i = 0; $i -lt 4; $i++) {
                $bBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.ColorConverter]::ConvertFromString($colors[$i]))
                $dc.DrawRoundedRectangle($bBrush, $op, (New-Object System.Windows.Rect $bxs[$i], $bys[$i], 95, 85), 18, 18)
            }
            # Connecting arrows
            $arPen = New-Object System.Windows.Media.Pen $accentBrush, 6
            $arPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $arPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $dc.DrawLine($arPen, (New-Object System.Windows.Point 230, 272), (New-Object System.Windows.Point 240, 272))
            $dc.DrawLine($arPen, (New-Object System.Windows.Point 230, 352), (New-Object System.Windows.Point 240, 352))
            # Order numbers on blocks
            $nbBrush = $whiteBrush
            for ($i = 1; $i -le 4; $i++) {
                $nx = if ($i % 2 -eq 1) { 155 } else { 260 }
                $ny = if ($i -le 2) { 250 } else { 375 }
                $ny += ($i - 1) / 2 * 125
                $dc.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point $nx, $ny), 15, 15)
            }
            # Sparkle connections
            Draw-Star $dc 110 160 11; Draw-Star $dc 400 190 11; Draw-Star $dc 390 430 10; Draw-Star $dc 115 430 10
        }
        # 15: Ghép chữ - letter blocks
        15 {
            # 3 big letter blocks
            $b1 = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 130, 130))
            $b2 = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 50))
            $b3 = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(100, 190, 240))
            $dc.DrawRoundedRectangle($b1, $op, (New-Object System.Windows.Rect 130, 220, 110, 110), 24, 24)
            $dc.DrawRoundedRectangle($b2, $op, (New-Object System.Windows.Rect 255, 170, 120, 120), 24, 24)
            $dc.DrawRoundedRectangle($b3, $op, (New-Object System.Windows.Rect 185, 340, 150, 115), 24, 24)
            # Letters
            function Draw-Letter([System.Windows.Media.DrawingContext]$ctx, [string]$letter, [double]$cx, [double]$cy, [double]$fz, [System.Windows.Media.Brush]$clr) {
                $ft = New-Object System.Windows.Media.FormattedText $letter, [System.Globalization.CultureInfo]::InvariantCulture, [System.Windows.FlowDirection]::LeftToRight, (New-Object System.Windows.Media.Typeface (New-Object System.Windows.Media.FontFamily "Segoe UI, Baloo 2, Fredoka, sans-serif"), [System.Windows.FontStyles]::Normal, [System.Windows.FontWeights]::ExtraBold, [System.Windows.FontStretches]::Normal), $fz, $clr, 1.0
                $ctx.DrawText($ft, (New-Object System.Windows.Point ($cx - $ft.Width/2), ($cy - $ft.Height/2)))
            }
            Draw-Letter $dc "A" 185 275 56 $whiteBrush
            Draw-Letter $dc "B" 315 230 60 $whiteBrush
            Draw-Letter $dc "C" 260 397 58 $whiteBrush
            # Sparkle indicators
            Draw-Star $dc 100 150 12; Draw-Star $dc 410 160 12; Draw-Star $dc 100 460 10; Draw-Star $dc 410 450 10
        }
        # 16: Viết câu - scroll/paper + wax seal
        16 {
            # Paper scroll
            $scrBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 252, 230))
            $dc.DrawRoundedRectangle($scrBrush, $op, (New-Object System.Windows.Rect 150, 160, 220, 300), 20, 20)
            # Roll decorations top/bottom
            $rollBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 195, 140))
            $dc.DrawRoundedRectangle($rollBrush, $op, (New-Object System.Windows.Rect 135, 148, 250, 32), 16, 16)
            $dc.DrawRoundedRectangle($rollBrush, $op, (New-Object System.Windows.Rect 135, 440, 250, 32), 16, 16)
            # Text lines
            $lPen = New-Object System.Windows.Media.Pen $accentBrush, 3
            for ($ly = 210; $ly -le 400; $ly += 30) {
                $dc.DrawLine($lPen, (New-Object System.Windows.Point 185, $ly), (New-Object System.Windows.Point 345, $ly))
            }
            # Wax seal
            $sealBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(220, 50, 50))
            $dc.DrawEllipse($sealBrush, $op, (New-Object System.Windows.Point 260, 350), 32, 32)
            # Star on seal
            Draw-Star $dc 260 350 36
            Draw-Star $dc 110 170 11; Draw-Star $dc 400 165 12; Draw-Star $dc 400 440 11; Draw-Star $dc 115 445 10
        }
        # 17: Tổng hợp - magic dice
        17 {
            # Dice 1 (white)
            $d1Brush = [System.Windows.Media.Brushes]::White
            $dc.DrawRoundedRectangle($d1Brush, $op, (New-Object System.Windows.Rect 145, 215, 125, 125), 24, 24)
            $dc.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point 180, 252), 10, 10)
            $dc.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point 232, 252), 10, 10)
            $dc.DrawEllipse($darkBrush, $null, (New-Object System.Windows.Point 207, 277), 10, 10)
            # Dice 2 (accent color)
            $dc.DrawRoundedRectangle($accentBrush, $op, (New-Object System.Windows.Rect 250, 280, 125, 125), 24, 24)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 285, 318), 10, 10)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 337, 318), 10, 10)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 285, 365), 10, 10)
            $dc.DrawEllipse($whiteBrush, $null, (New-Object System.Windows.Point 337, 365), 10, 10)
            # Magic sparkles around dice
            Draw-Star $dc 130 165 16; Draw-Star $dc 400 190 18; Draw-Star $dc 410 420 14; Draw-Star $dc 130 450 15
            # Floating mini symbols
            $dc.DrawEllipse($accentBrush, $null, (New-Object System.Windows.Point 115, 330), 10, 10)
            $dc.DrawEllipse($accentBrush, $null, (New-Object System.Windows.Point 400, 330), 10, 10)
        }
        # 18: Nối cặp - linking cards with chain
        18 {
            # Card left (purple)
            $lCardBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(140, 100, 230))
            $dc.DrawRoundedRectangle($lCardBrush, $op, (New-Object System.Windows.Rect 110, 220, 110, 155), 20, 20)
            # Lines inside
            $wLinePen = New-Object System.Windows.Media.Pen ([System.Windows.Media.Brushes]::White), 5
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 130, 262), (New-Object System.Windows.Point 200, 262))
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 130, 285), (New-Object System.Windows.Point 185, 285))
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 130, 308), (New-Object System.Windows.Point 190, 308))
            # Card right (teal)
            $rCardBrush = New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(38, 198, 218))
            $dc.DrawRoundedRectangle($rCardBrush, $op, (New-Object System.Windows.Rect 300, 220, 110, 155), 20, 20)
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 320, 262), (New-Object System.Windows.Point 390, 262))
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 320, 285), (New-Object System.Windows.Point 375, 285))
            $dc.DrawLine($wLinePen, (New-Object System.Windows.Point 320, 308), (New-Object System.Windows.Point 380, 308))
            # Connecting gold arc link
            $linkPen = New-Object System.Windows.Media.Pen (New-Object System.Windows.Media.SolidColorBrush ([System.Windows.Media.Color]::FromRgb(255, 210, 50))), 14
            $linkPen.StartLineCap = [System.Windows.Media.PenLineCap]::Round; $linkPen.EndLineCap = [System.Windows.Media.PenLineCap]::Round
            $lkpg = New-Object System.Windows.Media.PathGeometry
            $lkpf = New-Object System.Windows.Media.PathFigure; $lkpf.StartPoint = New-Object System.Windows.Point 220, 297; $lkpf.IsClosed = $false
            $la = New-Object System.Windows.Media.ArcSegment; $la.Point = New-Object System.Windows.Point 300, 297; $la.Size = New-Object System.Windows.Size 50, 35; $la.SweepDirection = [System.Windows.Media.SweepDirection]::Counterclockwise
            $lkpf.Segments.Add($la); $lkpg.Figures.Add($lkpf); $dc.DrawGeometry($null, $linkPen, $lkpg)
            $la2 = New-Object System.Windows.Media.ArcSegment; $la2.Point = New-Object System.Windows.Point 220, 297; $la2.Size = New-Object System.Windows.Size 50, 35; $la2.SweepDirection = [System.Windows.Media.SweepDirection]::Counterclockwise
            $lkpf2 = New-Object System.Windows.Media.PathFigure; $lkpf2.StartPoint = New-Object System.Windows.Point 300, 297; $lkpf2.IsClosed = $false
            $lkpf2.Segments.Add($la2); $lkpg2 = New-Object System.Windows.Media.PathGeometry; $lkpg2.Figures.Add($lkpf2); $dc.DrawGeometry($null, $linkPen, $lkpg2)
            Draw-Star $dc 260 200 26; Draw-Star $dc 100 160 11; Draw-Star $dc 410 160 12; Draw-Star $dc 410 440 10; Draw-Star $dc 100 440 10
        }
    }

    $dc.Close()
    [CardEngine2]::SaveArt($dv, $w, $h, $outPath)
}

Write-Host "Art function loaded."
