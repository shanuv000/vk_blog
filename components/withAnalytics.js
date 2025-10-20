import React, { useEffect } from 'react';
import * as analytics from '../lib/analytics';

/**
 * Higher-order component to add analytics tracking to any component
 * @param {React.ComponentType} Component - The component to wrap with analytics
 * @param {Object} options - Analytics options
 * @param {string} options.componentName - Name of the component for tracking
 * @param {string} options.eventCategory - Category for the events
 * @returns {React.ComponentType} - The wrapped component with analytics
 */
const withAnalytics = (Component, { componentName, eventCategory = 'Component Interaction' }) => {
  const WithAnalytics = (props) => {
    useEffect(() => {
      // Track component mount
      analytics.event({
        action: 'component_view',
        category: eventCategory,
        label: componentName,
      });

      return () => {
        // Track component unmount
        analytics.event({
          action: 'component_exit',
          category: eventCategory,
          label: componentName,
        });
      };
    }, []);

    // Create wrapped event handlers
    const wrapWithTracking = (handler, actionName) => {
      if (!handler) {return undefined;}
      
      return (...args) => {
        // Track the event
        analytics.event({
          action: actionName,
          category: eventCategory,
          label: componentName,
        });
        
        // Call the original handler
        return handler(...args);
      };
    };

    // Create new props with wrapped event handlers
    const enhancedProps = { ...props };
    
    // Wrap common event handlers
    if (props.onClick) {enhancedProps.onClick = wrapWithTracking(props.onClick, 'click');}
    if (props.onSubmit) {enhancedProps.onSubmit = wrapWithTracking(props.onSubmit, 'submit');}
    if (props.onChange) {enhancedProps.onChange = wrapWithTracking(props.onChange, 'change');}
    if (props.onFocus) {enhancedProps.onFocus = wrapWithTracking(props.onFocus, 'focus');}
    if (props.onBlur) {enhancedProps.onBlur = wrapWithTracking(props.onBlur, 'blur');}

    return <Component {...enhancedProps} />;
  };

  // Set display name for debugging
  WithAnalytics.displayName = `withAnalytics(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAnalytics;
};

export default withAnalytics;
