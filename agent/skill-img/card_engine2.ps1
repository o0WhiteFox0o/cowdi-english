Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase, System.Xaml, System.Drawing

$engineCode = @"
using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;

public class CardEngine2 {
    public static void RenderCard(
        string artPath, string titleText, string leftSubText, string rightTagText,
        string bgColorHex, string bannerColorHex, string metaTextColorHex, string outputPath
    ) {
        int width = 520; int height = 840;
        Border card = new Border {
            Width = width, Height = height,
            CornerRadius = new CornerRadius(28),
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bgColorHex)),
            BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            BorderThickness = new Thickness(8),
            Padding = new Thickness(36, 40, 36, 24)
        };
        Grid grid = new Grid();
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(560) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(20) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(92) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(16) });
        grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(48) });

        Border frame = new Border {
            CornerRadius = new CornerRadius(24),
            Background = Brushes.White,
            BorderBrush = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            BorderThickness = new Thickness(4), ClipToBounds = true
        };
        Grid frameGrid = new Grid();
        if (File.Exists(artPath)) {
            BitmapImage bmp = new BitmapImage();
            bmp.BeginInit();
            bmp.UriSource = new Uri(artPath, UriKind.Absolute);
            bmp.CacheOption = BitmapCacheOption.OnLoad;
            bmp.EndInit();
            frameGrid.Children.Add(new Image { Source = bmp, Stretch = Stretch.UniformToFill });
        }
        Border glass = new Border();
        LinearGradientBrush glassGrad = new LinearGradientBrush { StartPoint = new Point(0, 0), EndPoint = new Point(1, 1) };
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.35));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(50, 255, 255, 255), 0.42));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.50));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(35, 255, 255, 255), 0.65));
        glassGrad.GradientStops.Add(new GradientStop(Color.FromArgb(0, 255, 255, 255), 0.72));
        glass.Background = glassGrad;
        frameGrid.Children.Add(glass);
        frame.Child = frameGrid;
        Grid.SetRow(frame, 0); grid.Children.Add(frame);

        Border banner = new Border {
            CornerRadius = new CornerRadius(16),
            Background = new SolidColorBrush((Color)ColorConverter.ConvertFromString(bannerColorHex)),
            Padding = new Thickness(16, 0, 16, 0)
        };
        Grid.SetRow(banner, 2);
        Grid bannerGrid = new Grid();
        bannerGrid.Children.Add(new TextBlock { Text = "◆", FontSize = 18, Foreground = Brushes.White, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Left });
        bannerGrid.Children.Add(new TextBlock { Text = "◆", FontSize = 18, Foreground = Brushes.White, VerticalAlignment = VerticalAlignment.Center, HorizontalAlignment = HorizontalAlignment.Right });
        double fs = titleText.Length > 15 ? 28 : titleText.Length > 12 ? 34 : titleText.Length > 9 ? 40 : 50;
        bannerGrid.Children.Add(new TextBlock {
            Text = titleText,
            FontFamily = new FontFamily("Segoe UI, Baloo 2, Fredoka, sans-serif"),
            FontWeight = FontWeights.ExtraBold, FontSize = fs,
            Foreground = Brushes.White, HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center
        });
        banner.Child = bannerGrid; grid.Children.Add(banner);

        Grid meta = new Grid(); Grid.SetRow(meta, 4);
        Color tc = (Color)ColorConverter.ConvertFromString(metaTextColorHex);
        double sf = leftSubText.Length > 26 ? 17 : leftSubText.Length > 20 ? 20 : 23;
        meta.Children.Add(new TextBlock { Text = leftSubText, FontFamily = new FontFamily("Segoe UI, Nunito, sans-serif"), FontWeight = FontWeights.SemiBold, FontSize = sf, Foreground = new SolidColorBrush(tc), HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Center });
        meta.Children.Add(new TextBlock { Text = rightTagText, FontFamily = new FontFamily("Segoe UI, Nunito, sans-serif"), FontWeight = FontWeights.ExtraBold, FontSize = 21, Foreground = new SolidColorBrush(tc), HorizontalAlignment = HorizontalAlignment.Right, VerticalAlignment = VerticalAlignment.Center });
        grid.Children.Add(meta);
        card.Child = grid;
        card.Measure(new Size(width, height)); card.Arrange(new Rect(0, 0, width, height)); card.UpdateLayout();
        RenderTargetBitmap rtb = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        rtb.Render(card);
        TransformedBitmap scaled = new TransformedBitmap(rtb, new ScaleTransform(0.5, 0.5));
        PngBitmapEncoder enc = new PngBitmapEncoder();
        enc.Frames.Add(BitmapFrame.Create(scaled));
        string dir = Path.GetDirectoryName(outputPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        using (FileStream fs2 = File.Create(outputPath)) enc.Save(fs2);
    }

    public static void SaveArt(DrawingVisual dv, int w, int h, string path) {
        RenderTargetBitmap rtb = new RenderTargetBitmap(w, h, 96, 96, PixelFormats.Pbgra32);
        rtb.Render(dv);
        PngBitmapEncoder enc = new PngBitmapEncoder();
        enc.Frames.Add(BitmapFrame.Create(rtb));
        string dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir)) Directory.CreateDirectory(dir);
        using (FileStream fs = File.Create(path)) enc.Save(fs);
    }
}
"@
Add-Type -TypeDefinition $engineCode -ReferencedAssemblies PresentationCore, PresentationFramework, WindowsBase, System.Xaml, System.Drawing
Write-Host "Engine loaded."
