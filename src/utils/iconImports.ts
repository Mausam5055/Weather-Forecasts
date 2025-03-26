// Function to get the icon URL
export const getIconUrl = (iconName: string) => {
  return new URL(`../../public/weather-icons-master/production/fill/all/${iconName}.svg`, import.meta.url).href;
}; 