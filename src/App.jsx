import React, { useState, useEffect } from 'react';
import './App.css';
import {
  slide1Hooks,
  slide2Opportunity,
  slide3Details,
  slide4ContentRewards,
  slide5Benefits,
  slide6CTA
} from './data/arabicContent';
import {
  luxuryFirstSlideImages,
  luxuryGeneralImages,
  allImages
} from './data/luxuryImages';

function App() {
  // Slides State
  const [slides, setSlides] = useState([
    { id: 1, title: '', subtitle: '', body: '', points: [], image: '', type: 'hook' },
    { id: 2, title: '', body: '', image: '', type: 'opp1' },
    { id: 3, title: '', body: '', image: '', type: 'opp2' },
    { id: 4, title: '', body: '', image: '', type: 'cr' }, // Content Rewards
    { id: 5, title: '', points: [], image: '', type: 'benefits' },
    { id: 6, title: '', body: '', image: '', type: 'cta' }
  ]);

  // Styling Customizations
  const [activeSlideId, setActiveSlideId] = useState(1);
  const [fontFamily, setFontFamily] = useState('Cairo');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [cardLayout, setCardLayout] = useState('glass-dark'); // glass-dark, glass-light, minimal
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [hashtag, setHashtag] = useState('#contentrewardspartner');
  const [commentKeyword, setCommentKeyword] = useState('CR');
  const [statusMessage, setStatusMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  // Generate a random index helper
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Generate completely new slideshow content and designs
  const generateNewSlideshow = () => {
    // 1. Pick templates
    const hook = getRandom(slide1Hooks);
    const opp1 = getRandom(slide2Opportunity);
    const opp2 = getRandom(slide3Details);
    const cr = getRandom(slide4ContentRewards);
    const benefits = getRandom(slide5Benefits);
    const cta = getRandom(slide6CTA);

    // 2. Set the CTA keyword from the selected CTA template
    setCommentKeyword(cta.keyword || 'CR');

    // 3. Pick images without repeats for general slides
    const firstSlideImg = getRandom(luxuryFirstSlideImages).url;
    
    // Shuffle general images and take first 5
    const shuffledGeneral = [...luxuryGeneralImages]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    const newSlides = [
      {
        id: 1,
        title: hook.title,
        subtitle: hook.subtitle,
        body: '',
        points: [],
        image: firstSlideImg,
        imageDataUrl: null,
        type: 'hook'
      },
      {
        id: 2,
        title: opp1.title,
        body: opp1.body,
        points: [],
        image: shuffledGeneral[0].url,
        imageDataUrl: null,
        type: 'opp1'
      },
      {
        id: 3,
        title: opp2.title,
        body: opp2.body,
        points: [],
        image: shuffledGeneral[1].url,
        imageDataUrl: null,
        type: 'opp2'
      },
      {
        id: 4,
        title: cr.title,
        body: cr.body,
        points: [],
        image: shuffledGeneral[2].url,
        imageDataUrl: null,
        type: 'cr'
      },
      {
        id: 5,
        title: benefits.title,
        body: '',
        points: benefits.points,
        image: shuffledGeneral[3].url,
        imageDataUrl: null,
        type: 'benefits'
      },
      {
        id: 6,
        title: cta.title,
        body: cta.body.replace('{keyword}', cta.keyword),
        points: [],
        image: shuffledGeneral[4].url,
        imageDataUrl: null,
        type: 'cta'
      }
    ];

    // Pick random font family
    const fonts = ['Cairo', 'Tajawal'];
    setFontFamily(getRandom(fonts));
    
    // Subtle overlay adjust
    setOverlayOpacity(0.4 + Math.random() * 0.2);

    // Set slides first (shows preview), then preload images in background
    setSlides(newSlides);
    preloadSlidesImages(newSlides);
  };

  // Convert any image URL to a base64 data URL using multiple proxy fallbacks
  const imageUrlToDataUrl = async (url) => {
    // Proxy 1: weserv.nl — reliable image CDN proxy with CORS support
    const weservUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1080&h=1920&fit=cover&output=jpg&q=90`;
    // Proxy 2: allorigins
    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const proxies = [weservUrl, allOriginsUrl, url];

    for (const proxyUrl of proxies) {
      try {
        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) continue;
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        // Try next proxy
      }
    }
    return null; // All failed — will draw gradient fallback
  };

  // Preload all 6 slide images as data URLs in parallel
  const preloadSlidesImages = async (slidesToLoad) => {
    setIsPreloading(true);
    showStatus('⏳ جاري تحميل الصور عالية الجودة... انتظر لحظة');

    const promises = slidesToLoad.map(async (slide) => {
      const dataUrl = await imageUrlToDataUrl(slide.image);
      return { id: slide.id, dataUrl };
    });

    const results = await Promise.all(promises);

    setSlides(prev => prev.map(slide => {
      const result = results.find(r => r.id === slide.id);
      return result ? { ...slide, imageDataUrl: result.dataUrl } : slide;
    }));

    setIsPreloading(false);
    showStatus('✅ الصور جاهزة! يمكنك الآن تنزيل الشرائح بجودة عالية.');
  };

  // Run generation on mount
  useEffect(() => {
    generateNewSlideshow();
  }, []);

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage('');
    }, 4000);
  };

  // Update slide property
  const updateSlideText = (id, field, val) => {
    setSlides(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: val };
      }
      return s;
    }));
  };

  const updateSlidePoints = (id, index, val) => {
    setSlides(prev => prev.map(s => {
      if (s.id === id) {
        const newPoints = [...s.points];
        newPoints[index] = val;
        return { ...s, points: newPoints };
      }
      return s;
    }));
  };

  // Change background image of a specific slide
  const setSlideImage = (id, imgUrl) => {
    setSlides(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, image: imgUrl };
      }
      return s;
    }));
  };

  // Shared: draw all text layers onto the canvas (hashtag, glass card, text, CTA)
  const renderSlideText = (ctx, canvas, slide) => {
    // 3. Draw Hashtag (top center)
    ctx.direction = 'rtl';
    ctx.font = `600 32px ${fontFamily}, system-ui`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    const hashText = hashtag;
    const hashWidth = ctx.measureText(hashText).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - hashWidth / 2 - 20, 60, hashWidth + 40, 56, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(hashText, canvas.width / 2, 100);

    // 4. Glass card background
    const cardWidth = canvas.width * 0.88;
    const cardX = (canvas.width - cardWidth) / 2;
    const cardY = canvas.height * 0.25;
    const cardHeight = canvas.height * 0.5;

    if (cardLayout.startsWith('glass')) {
      ctx.fillStyle = cardLayout === 'glass-dark'
        ? 'rgba(0, 0, 0, 0.65)'
        : 'rgba(255, 255, 255, 0.88)';
      ctx.strokeStyle = cardLayout === 'glass-dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 30);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Text inside card
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    const cardCenter = canvas.width / 2;
    let textY = cardY + 80;
    const textColor = cardLayout === 'glass-light' ? '#0d0f12' : '#ffffff';
    const accentColor = '#e5c158';

    // Title
    ctx.font = `800 ${Math.round(52 * fontSizeMultiplier)}px ${fontFamily}, system-ui`;
    ctx.fillStyle = textColor;
    textY = wrapCanvasText(ctx, slide.title, cardCenter, textY, cardWidth - 80, 74);

    // Subtitle (Slide 1)
    if (slide.subtitle) {
      textY += 30;
      ctx.font = `700 ${Math.round(36 * fontSizeMultiplier)}px ${fontFamily}, system-ui`;
      ctx.fillStyle = accentColor;
      textY = wrapCanvasText(ctx, slide.subtitle, cardCenter, textY, cardWidth - 80, 52);
    }

    // Body text (Slides 2, 3, 4, 6)
    if (slide.body) {
      textY += 40;
      ctx.font = `600 ${Math.round(32 * fontSizeMultiplier)}px ${fontFamily}, system-ui`;
      ctx.fillStyle = cardLayout === 'glass-light' ? '#334155' : 'rgba(255,255,255,0.9)';
      textY = wrapCanvasText(ctx, slide.body, cardCenter, textY, cardWidth - 80, 46);
    }

    // Points (Slide 5)
    if (slide.points && slide.points.length > 0) {
      textY += 30;
      ctx.textAlign = 'right';
      const listX = cardX + cardWidth - 60;
      slide.points.forEach((point) => {
        ctx.font = `700 ${Math.round(30 * fontSizeMultiplier)}px ${fontFamily}, system-ui`;
        ctx.fillStyle = textColor;
        ctx.fillText(point, listX, textY);
        textY += 58;
      });
    }

    // 6. CTA Pill at bottom
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.font = `800 32px ${fontFamily}, system-ui`;
    const ctaText = `اكتب "${commentKeyword}" في التعليقات 👇`;
    const ctaWidth = ctx.measureText(ctaText).width;
    ctx.fillStyle = '#fe2c55';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - ctaWidth / 2 - 40, canvas.height - 140, ctaWidth + 80, 75, 38);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(ctaText, canvas.width / 2, canvas.height - 92);
  };

  // Draw gradient background as fallback if image fails
  const drawGradientBg = (ctx, canvas) => {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0d0f13');
    grad.addColorStop(0.5, '#1a1d27');
    grad.addColorStop(1, '#0a0c10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Canvas drawing and rendering logic — uses pre-loaded data URLs (CORS-free)
  const renderSlideToCanvas = async (slide, canvas) => {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Use pre-loaded base64 data URL (no CORS restriction at all)
      const imgSrc = slide.imageDataUrl;

      if (!imgSrc) {
        // No data URL yet — draw gradient fallback and still render text
        drawGradientBg(ctx, canvas);
        renderSlideText(ctx, canvas, slide);
        resolve();
        return;
      }

      img.src = imgSrc;

      img.onload = () => {
        // 1. Draw Background (Cover fit)
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, drawX, drawY;
        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        // 2. Dark overlay
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 3. Text layers
        renderSlideText(ctx, canvas, slide);
        resolve();
      };

      img.onerror = () => {
        drawGradientBg(ctx, canvas);
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderSlideText(ctx, canvas, slide);
        resolve();
      };
    });
  };

  // Custom text wrap for HTML5 Canvas
  const wrapCanvasText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const paragraphs = text.split('\n');
    let currentY = y;
    
    for (let i = 0; i < paragraphs.length; i++) {
      const words = paragraphs[i].split(' ');
      let line = '';
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + (line ? ' ' : '') + words[n];
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n];
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  // Trigger a canvas->PNG download reliably across browsers
  const triggerDownload = (canvas, filename) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          showStatus('❌ فشل تحويل الصورة — يرجى التحقق من إعدادات المتصفح.');
          resolve();
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Give browser time to start download before revoking
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve();
      }, 'image/png');
    });
  };

  // Download a single slide
  const downloadSlide = async (slide) => {
    setIsDownloading(true);
    showStatus(`⏳ جاري معالجة وتنزيل الشريحة ${slide.id}...`);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      await renderSlideToCanvas(slide, canvas);
      await triggerDownload(canvas, `CR-slide-${slide.id}-${slide.type}.png`);
      showStatus(`✅ تم تنزيل الشريحة ${slide.id} بنجاح!`);
    } catch(err) {
      console.error('Download error:', err);
      showStatus(`❌ حدث خطأ أثناء تنزيل الشريحة ${slide.id}.`);
    }
    setIsDownloading(false);
  };

  // Download all 6 slides in order
  const downloadAllSlides = async () => {
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: slides.length });
    showStatus(`⏳ جاري تنزيل جميع الشرائح الـ ${slides.length}... الرجاء الانتظار`);
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      setDownloadProgress({ current: i + 1, total: slides.length });
      showStatus(`⏳ معالجة الشريحة ${i + 1} من ${slides.length}...`);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        await renderSlideToCanvas(slide, canvas);
        await triggerDownload(canvas, `CR-slide-${slide.id}-${slide.type}.png`);
        // Short delay so browser registers each download
        await new Promise(resolve => setTimeout(resolve, 1200));
      } catch(err) {
        console.error(`Slide ${slide.id} download error:`, err);
      }
    }
    
    setIsDownloading(false);
    setDownloadProgress({ current: 0, total: 0 });
    showStatus('🎉 تم تنزيل جميع الشرائح الـ 6 بنجاح! تحقق من مجلد التنزيلات على جهازك.');
  };

  const selectedSlide = slides.find(s => s.id === activeSlideId) || slides[0];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <h1>
            <span className="logo-badge">TikTok</span>
            منشئ سلايدات برنامج مكافآت المحتوى
          </h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={generateNewSlideshow} disabled={isDownloading}>
            <span className="btn-icon">⚡</span>
            توليد محتوى وتصميم جديد
          </button>
          <button className="btn btn-gold" onClick={downloadAllSlides} disabled={isDownloading}
            style={{ opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? 'not-allowed' : 'pointer' }}>
            <span className="btn-icon">{isDownloading ? '⏳' : '📥'}</span>
            {isDownloading
              ? downloadProgress.total > 0
                ? `جاري التحميل (${downloadProgress.current}/${downloadProgress.total})`
                : 'جاري المعالجة...'
              : 'تحميل جميع الصور (HD)'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="app-content">
        
        {/* Left Control Panel */}
        <aside className="sidebar">
          
          {/* Active Edit Area */}
          <div>
            <h2 className="section-title">
              تعديل الشريحة النشطة {selectedSlide.id}
            </h2>
            <div className="control-group">
              <label className="control-label">عنوان الشريحة الرئيسية:</label>
              <textarea
                className="text-input"
                rows="2"
                value={selectedSlide.title}
                onChange={(e) => updateSlideText(selectedSlide.id, 'title', e.target.value)}
                placeholder="أدخل عنوان الشريحة هنا..."
              />
              
              {selectedSlide.subtitle !== undefined && (
                <>
                  <label className="control-label">العنوان الفرعي (جاذب الانتباه):</label>
                  <input
                    type="text"
                    className="text-input"
                    value={selectedSlide.subtitle}
                    onChange={(e) => updateSlideText(selectedSlide.id, 'subtitle', e.target.value)}
                    placeholder="العنوان الفرعي..."
                  />
                </>
              )}

              {selectedSlide.body !== undefined && (
                <>
                  <label className="control-label">نص الشريحة التفصيلي:</label>
                  <textarea
                    className="text-input"
                    rows="4"
                    value={selectedSlide.body}
                    onChange={(e) => updateSlideText(selectedSlide.id, 'body', e.target.value)}
                    placeholder="أدخل نص المحتوى..."
                  />
                </>
              )}

              {selectedSlide.points !== undefined && selectedSlide.points.length > 0 && (
                <>
                  <label className="control-label">النقاط والمميزات (لماذا الكليبينج؟):</label>
                  {selectedSlide.points.map((pt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="text-input"
                      value={pt}
                      onChange={(e) => updateSlidePoints(selectedSlide.id, idx, e.target.value)}
                      placeholder={`الميزة رقم ${idx + 1}`}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Change Slide Image */}
          <div>
            <h2 className="section-title">صورة الخلفية</h2>
            <div className="control-group">
              <label className="control-label">اختر صورة فاخرة مناسبة:</label>
              <div className="img-cycler">
                {(selectedSlide.id === 1 ? luxuryFirstSlideImages : luxuryGeneralImages).map((img, index) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.name}
                    className={`img-thumbnail ${selectedSlide.image === img.url ? 'active' : ''}`}
                    onClick={() => setSlideImage(selectedSlide.id, img.url)}
                  />
                ))}
              </div>
              <label className="control-label">أو ضع رابط صورة مخصص (URL):</label>
              <input
                type="text"
                className="text-input"
                value={selectedSlide.image}
                onChange={(e) => setSlideImage(selectedSlide.id, e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Global Customizations */}
          <div>
            <h2 className="section-title">إعدادات التصميم والتنسيق</h2>
            <div className="control-group">
              <label className="control-label">نوع الخط العربي:</label>
              <div className="font-presets">
                <button 
                  className={`font-btn ${fontFamily === 'Cairo' ? 'active' : ''}`} 
                  onClick={() => setFontFamily('Cairo')}
                >
                  خط القاهرة (Cairo)
                </button>
                <button 
                  className={`font-btn ${fontFamily === 'Tajawal' ? 'active' : ''}`} 
                  onClick={() => setFontFamily('Tajawal')}
                >
                  خط التجوال (Tajawal)
                </button>
              </div>

              <label className="control-label">درجة تعتيم الخلفية (Overlay):</label>
              <input
                type="range"
                className="range-slider"
                min="0.1"
                max="0.9"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              />
              <span style={{ fontSize: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>
                {Math.round(overlayOpacity * 100)}%
              </span>

              <label className="control-label">نمط بطاقة النصوص:</label>
              <select 
                className="select-input"
                value={cardLayout} 
                onChange={(e) => setCardLayout(e.target.value)}
              >
                <option value="glass-dark">زجاجي داكن (موصى به)</option>
                <option value="glass-light">زجاجي مضيء</option>
                <option value="minimal">بدون بطاقة (نصوص مباشرة)</option>
              </select>

              <label className="control-label">تعديل حجم الخط:</label>
              <input
                type="range"
                className="range-slider"
                min="0.7"
                max="1.4"
                step="0.05"
                value={fontSizeMultiplier}
                onChange={(e) => setFontSizeMultiplier(parseFloat(e.target.value))}
              />
              <span style={{ fontSize: '0.8rem', textAlign: 'left', color: 'var(--text-secondary)' }}>
                {Math.round(fontSizeMultiplier * 100)}%
              </span>
            </div>
          </div>

          {/* Campaign Requirements Settings */}
          <div>
            <h2 className="section-title">إعدادات الحملة والأتمتة</h2>
            <div className="control-group">
              <label className="control-label">الوسم الإلزامي (Hashtag):</label>
              <input
                type="text"
                className="text-input"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
              />
              
              <label className="control-label">الكلمة المفتاحية للأتمتة (Keyword):</label>
              <input
                type="text"
                className="text-input"
                value={commentKeyword}
                onChange={(e) => setCommentKeyword(e.target.value)}
                placeholder="CR"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                * سيتم تحديث الكلمة المفتاحية في الشريط العائم أسفل كافة الشرائح لحث المتابعين على التعليق لتشغيل أداة ManyChat/CommentShark.
              </p>
            </div>
          </div>

          {/* Guide Rules */}
          <div className="instructions-box">
            <h3 className="instructions-title">شروط القبول الهامة ⚠️</h3>
            <ul className="instructions-list">
              <li>يجب تضمين <b>Slide 4</b> الذي يشرح برنامج <b>Content Rewards</b> لتفادي رفض الفيديو.</li>
              <li>يجب استخدام الهاشتاج <b>{hashtag}</b> في الوصف.</li>
              <li>تأكد من وضع رابط الإحالة الخاص بك في <b>البايو (Bio)</b> وتفعيله في أتمتة ManyChat.</li>
            </ul>
          </div>

        </aside>

        {/* Right Preview Grid & Workspace */}
        <section className="workspace">
          {statusMessage && (
            <div className="status-bar">
              <span>{statusMessage}</span>
              <button 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setStatusMessage('')}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
              معاينة الشرائح (9:16 Portrait) - انقر على أي شريحة لتعديل نصوصها وصورتها
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              إجمالي الشرائح: {slides.length}
            </span>
          </div>

          <div className="slides-grid">
            {slides.map((slide) => {
              const isActive = slide.id === activeSlideId;
              
              return (
                <div 
                  key={slide.id}
                  className={`tiktok-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSlideId(slide.id)}
                >
                  {/* Slide number */}
                  <div className="slide-number-badge">{slide.id} / 6</div>
                  
                  {/* Background Image */}
                  {slide.image && (
                    <img 
                      src={slide.image} 
                      className="slide-image-bg" 
                      alt={`Slide ${slide.id}`} 
                    />
                  )}
                  
                  {/* Overlay opacity */}
                  <div 
                    className="slide-overlay" 
                    style={{ background: `rgba(0, 0, 0, ${overlayOpacity})` }}
                  />
                  
                  {/* Content Container */}
                  <div className="slide-content-wrapper" style={{ fontFamily: fontFamily }}>
                    
                    {/* Hashtag on top */}
                    <div className="slide-hashtag">{hashtag}</div>
                    
                    {/* Main content body inside Glass Card */}
                    <div className={`glass-text-card ${cardLayout === 'glass-light' ? 'light' : ''} ${cardLayout === 'minimal' ? 'minimal' : ''}`}
                         style={cardLayout === 'minimal' ? { background: 'none', border: 'none', backdropFilter: 'none', boxShadow: 'none' } : {}}>
                      
                      <h3 className="slide-title" style={{ fontSize: `${1.3 * fontSizeMultiplier}rem` }}>
                        {slide.title}
                      </h3>
                      
                      {slide.subtitle && (
                        <p className="slide-subtitle" style={{ fontSize: `${0.95 * fontSizeMultiplier}rem` }}>
                          {slide.subtitle}
                        </p>
                      )}
                      
                      {slide.body && (
                        <p className="slide-body" style={{ fontSize: `${0.85 * fontSizeMultiplier}rem` }}>
                          {slide.body}
                        </p>
                      )}

                      {slide.points && slide.points.length > 0 && (
                        <ul className="slide-points-list">
                          {slide.points.map((pt, idx) => (
                            <li key={idx} className="slide-point-item" style={{ fontSize: `${0.8 * fontSizeMultiplier}rem` }}>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                    </div>

                    {/* Bottom CTA floating bar */}
                    <div className="slide-cta-pill">
                      اكتب "{commentKeyword}" في التعليقات 👇
                    </div>

                  </div>

                  {/* Actions layer on hover */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '5px' }}>
                    <button 
                      className="btn btn-secondary card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSlide(slide);
                      }}
                    >
                      تنزيل كـ PNG 📥
                    </button>
                    <button 
                      className="btn btn-secondary card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideId(slide.id);
                      }}
                      style={{ background: isActive ? 'var(--accent-tiktok)' : 'rgba(0,0,0,0.6)', color: 'white' }}
                    >
                      تعديل ✏️
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
