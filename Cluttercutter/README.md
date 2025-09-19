# Multi-Step Survey Form

A responsive, multi-section survey form that integrates with Google Forms for data collection. Features progressive navigation, validation, and seamless submission handling.

## 🚀 Features

- **Multi-step Navigation**: Clean sectioned interface with previous/next buttons
- **Form Validation**: Real-time validation for required fields and radio button groups
- **Google Forms Integration**: Seamless data submission to Google Forms backend
- **Progress Tracking**: Maintains page history and visit tracking
- **Accessibility**: Keyboard navigation support and ARIA labels
- **Responsive Design**: Mobile-friendly layout (via external CSS)
- **Error Handling**: Comprehensive submission error handling with timeout protection

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with fieldsets and proper form structure
- **Vanilla JavaScript**: No external dependencies, pure DOM manipulation
- **CSS3**: External stylesheet for responsive design
- **Google Forms API**: Backend data collection and storage
- **Hidden iframe**: Cross-origin form submission handling

## 📁 Project Structure

```
project/
├── index.html          # Main HTML structure
├── styles.css          # Stylesheet (external)
├── scripts.js          # JavaScript functionality
└── README.md           # This file
```

## 🔧 Build Process

### Prerequisites
- Modern web browser with JavaScript enabled
- Google Forms account for data collection
- Web server (for production deployment)

### Setup Instructions

1. **Clone/Download** the project files to your web directory

2. **Configure Google Forms Integration**:
   - Create a new Google Form with matching field names
   - Get the form's `formResponse` URL
   - Replace the action URL in the hidden form:
   ```html
   <form id="googlePostForm" ... 
         action="YOUR_GOOGLE_FORM_RESPONSE_URL">
   ```

3. **Customize Survey Content**:
   - Edit questions and options in `index.html`
   - Ensure `name` attributes match your Google Form entry IDs
   - Modify validation rules in `scripts.js` if needed

4. **Style Customization**:
   - Update `styles.css` for visual branding
   - Modify button styles and section layouts
   - Add responsive breakpoints as needed

### Development Workflow

1. **Local Development**:
   ```bash
   # Serve files locally (Python example)
   python -m http.server 8000
   # Or use any static file server
   ```

2. **Testing**:
   - Test all navigation paths
   - Verify form validation
   - Check Google Forms submission
   - Test on multiple devices/browsers

3. **Deployment**:
   - Upload files to web server
   - Ensure HTTPS for production use
   - Test live Google Forms integration

## 📋 Form Configuration

### Field Mapping
The form uses Google Forms entry IDs for seamless integration:

| Question | Entry ID | Type |
|----------|----------|------|
| Files created daily | `entry.1460523037` | Radio |
| Frustration frequency | `entry.52109554` | Radio |
| File finding difficulty | `entry.1060996270` | Radio |
| Tool interest level | `entry.763260311` | Radio |
| Feature rankings | `entry.468551687`, `entry.1340553446`, `entry.1883183100` | Radio groups |
| Sharing likelihood | `entry.443116300` | Radio |
| User sentiment | `entry.577572739` | Textarea |
| Software naming | `entry.1730161653` | Textarea |

### Hidden Fields
The system automatically includes:
- `pageHistory`: Tracks user navigation path
- `fbzx`: Google Forms security token
- `fvv`: Form version identifier
- `timestamp_local`: Submission timestamp

## 🎯 Key JavaScript Functions

### Navigation Management
```javascript
showSection(idx)        // Display specific section
validateSection(idx)    // Validate required fields
recordVisited(idx)      // Track page visits
```

### Form Handling
```javascript
buildGoogleForm()       // Prepare hidden form for submission
submitToGoogle()        // Handle iframe-based submission
setStatus(msg, isError) // Update user feedback
```

## 🔍 Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript**: ES6+ features used
- **Required APIs**: FormData, Promises, addEventListener
- **Fallbacks**: Graceful degradation for older browsers

## 🚦 Error Handling

The system includes comprehensive error handling:
- **Validation Errors**: Real-time feedback for incomplete fields
- **Network Issues**: Timeout protection (12-second limit)
- **Submission Failures**: User-friendly error messages
- **Console Logging**: Detailed debugging information

## 📈 Performance Considerations

- **Lightweight**: No external libraries or frameworks
- **Fast Loading**: Minimal HTML/CSS/JS footprint  
- **Efficient DOM**: Event delegation and minimal re-renders
- **Memory Friendly**: Proper cleanup of event listeners

## 🔒 Security Notes

- **CSRF Protection**: Google Forms built-in security
- **Data Validation**: Client and server-side validation
- **HTTPS Recommended**: For production deployments
- **No Sensitive Data**: Survey designed for non-sensitive information

## 📝 Customization Guide

### Adding New Sections
1. Create new `<fieldset data-section="N">` in HTML
2. Add navigation buttons
3. Update `sections` array handling in JavaScript
4. Add corresponding Google Form fields

### Modifying Validation
```javascript
// Custom validation example
function validateSection(idx) {
  // Add custom validation logic here
  return true; // or false
}
```

### Styling Sections
```css
.section {
  /* Base section styles */
}

.section-hidden {
  /* Hidden section styles */
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For questions or issues:
- Check browser console for debugging information
- Verify Google Forms integration setup
- Test with network developer tools
- Review validation logic for custom requirements

---

*Built with ❤️ using vanilla web technologies*