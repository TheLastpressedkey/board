export type ContentType = 
  | 'text' 
  | 'link' 
  | 'embed' 
  | 'app' 
  | 'userapp'
  | 'theme' 
  | 'shortcut'
  | `app-${string}`;