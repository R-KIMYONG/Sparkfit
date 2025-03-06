/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,jsx}'],
  theme: {
    extend: {
      colors: {
        customBackground: '#EAF6FE',
        customLoginButton: '#82C0F9',
        customSignupButton: '#E4E4E4',
        customSocialButton: '#FFD056',
        'btn-blue': '#82C0F9',
        default: '#efefef'
      },
      boxShadow: {
        sidebarshaow: '10px 4px 15px rgba(0, 0, 0, 0.05)',
        bottomsidebarshaow: '0px -4px 15px rgba(0, 0, 0, 0.1)'
      },
      width: {
        logowidth: '31px',
        iconwidth: '24px'
      },
      height: {
        iconheight: '24px',
        logoheight: '31px',
        'calc-full-minus-110': '90%'
      },
      marginTop: {
        sidebarmargin: '5px'
      }
    }
  },
  plugins: [require('tailwind-scrollbar-hide')]
};
