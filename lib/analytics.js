/**
 * Google Analytics utility functions
 */

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (typeof window === 'undefined' || !measurementId) {return;}

  // Create script elements for Google Analytics
  const createGAScript = () => {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}', {
        page_path: window.location.pathname,
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true
      });
    `;
    
    document.head.appendChild(script1);
    document.head.appendChild(script2);
  };

  // Only create scripts if they don't already exist
  if (!window.gtag) {
    createGAScript();
  }
};

// Track page view
export const pageview = (url, title) => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Track event
export const event = ({ action, category, label, value, ...rest }) => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...rest,
  });
};

// Track user timing
export const timing = ({ name, value, category, label }) => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  window.gtag('event', 'timing_complete', {
    name,
    value,
    event_category: category,
    event_label: label,
  });
};

// Set user properties
export const setUserProperties = (properties) => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  window.gtag('set', 'user_properties', properties);
};

// Track exception
export const exception = ({ description, fatal = false }) => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  window.gtag('event', 'exception', {
    description,
    fatal,
  });
};

// Track scroll depth
export const trackScrollDepth = () => {
  if (typeof window === 'undefined') {return;}
  
  const scrollDepthTriggered = {
    25: false,
    50: false,
    75: false,
    90: false
  };
  
  const calculateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    if (documentHeight <= windowHeight) {return;}
    
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    if (scrollPercent >= 25 && !scrollDepthTriggered[25]) {
      event({
        action: 'scroll_depth',
        category: 'Engagement',
        label: 'Scrolled 25%',
        value: 25
      });
      scrollDepthTriggered[25] = true;
    }
    
    if (scrollPercent >= 50 && !scrollDepthTriggered[50]) {
      event({
        action: 'scroll_depth',
        category: 'Engagement',
        label: 'Scrolled 50%',
        value: 50
      });
      scrollDepthTriggered[50] = true;
    }
    
    if (scrollPercent >= 75 && !scrollDepthTriggered[75]) {
      event({
        action: 'scroll_depth',
        category: 'Engagement',
        label: 'Scrolled 75%',
        value: 75
      });
      scrollDepthTriggered[75] = true;
    }
    
    if (scrollPercent >= 90 && !scrollDepthTriggered[90]) {
      event({
        action: 'scroll_depth',
        category: 'Engagement',
        label: 'Scrolled 90%',
        value: 90
      });
      scrollDepthTriggered[90] = true;
    }
  };
  
  window.addEventListener('scroll', calculateScrollDepth, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', calculateScrollDepth);
  };
};

// Track time on page
export const trackTimeOnPage = () => {
  if (typeof window === 'undefined' || !window.gtag) {return;}
  
  const startTime = new Date();
  const timeIntervals = [30, 60, 120, 180, 300]; // seconds
  const triggeredIntervals = {};
  
  const checkTimeOnPage = () => {
    const currentTime = new Date();
    const timeSpent = Math.floor((currentTime - startTime) / 1000); // in seconds
    
    timeIntervals.forEach(interval => {
      if (timeSpent >= interval && !triggeredIntervals[interval]) {
        event({
          action: 'time_on_page',
          category: 'Engagement',
          label: `${interval} seconds`,
          value: interval
        });
        triggeredIntervals[interval] = true;
      }
    });
  };
  
  const intervalId = setInterval(checkTimeOnPage, 1000);
  
  return () => {
    clearInterval(intervalId);
    
    // Send final time on page when user leaves
    const finalTime = Math.floor((new Date() - startTime) / 1000);
    event({
      action: 'time_on_page_exit',
      category: 'Engagement',
      label: 'Exit',
      value: finalTime
    });
  };
};

// Track outbound links
export const trackOutboundLinks = () => {
  if (typeof window === 'undefined') {return;}
  
  const handleLinkClick = (e) => {
    const link = e.currentTarget;
    const url = link.href;
    const isExternal = link.hostname !== window.location.hostname;
    
    if (isExternal && window.gtag) {
      // Prevent default behavior
      e.preventDefault();
      
      // Track the outbound link click
      event({
        action: 'outbound_link_click',
        category: 'Outbound Links',
        label: url,
      });
      
      // Navigate after a small delay to ensure the event is tracked
      setTimeout(() => {
        window.open(url, link.target);
      }, 100);
    }
  };
  
  // Add click event listeners to all external links
  document.querySelectorAll('a').forEach(link => {
    if (link.hostname !== window.location.hostname) {
      link.addEventListener('click', handleLinkClick);
    }
  });
  
  return () => {
    document.querySelectorAll('a').forEach(link => {
      if (link.hostname !== window.location.hostname) {
        link.removeEventListener('click', handleLinkClick);
      }
    });
  };
};

// Track file downloads
export const trackFileDownloads = () => {
  if (typeof window === 'undefined') {return;}
  
  const fileExtensions = ['pdf', 'xlsx', 'docx', 'zip', 'txt', 'csv'];
  
  const handleDownloadClick = (e) => {
    const link = e.currentTarget;
    const url = link.href;
    const extension = url.split('.').pop().toLowerCase();
    
    if (fileExtensions.includes(extension) && window.gtag) {
      event({
        action: 'file_download',
        category: 'Downloads',
        label: url,
        file_extension: extension,
        file_name: url.split('/').pop()
      });
    }
  };
  
  // Add click event listeners to all download links
  document.querySelectorAll('a').forEach(link => {
    const url = link.href;
    const extension = url.split('.').pop().toLowerCase();
    
    if (fileExtensions.includes(extension)) {
      link.addEventListener('click', handleDownloadClick);
    }
  });
  
  return () => {
    document.querySelectorAll('a').forEach(link => {
      const url = link.href;
      const extension = url.split('.').pop().toLowerCase();
      
      if (fileExtensions.includes(extension)) {
        link.removeEventListener('click', handleDownloadClick);
      }
    });
  };
};
