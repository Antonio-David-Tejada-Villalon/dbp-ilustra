/* DBP Ilustra — componentes del Design System (versión ES module del bundle publicado).
   Fuente: artefacto "DBP Ilustra" (Design System). No editar a mano sin actualizar el sistema. */
import React from "react";
  var h = React.createElement;
  var ICONS = {"search": "<svg class=\"lucide lucide-search\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m21 21-4.34-4.34\"/> <circle cx=\"11\" cy=\"11\" r=\"8\"/>", "check": "<svg class=\"lucide lucide-check\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M20 6 9 17l-5-5\"/>", "user-plus": "<svg class=\"lucide lucide-user-plus\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/> <line x1=\"19\" x2=\"19\" y1=\"8\" y2=\"14\"/> <line x1=\"22\" x2=\"16\" y1=\"11\" y2=\"11\"/>", "bookmark": "<svg class=\"lucide lucide-bookmark\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\"/>", "heart": "<svg class=\"lucide lucide-heart\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>", "message-circle": "<svg class=\"lucide lucide-message-circle\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>", "map-pin": "<svg class=\"lucide lucide-map-pin\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/> <circle cx=\"12\" cy=\"10\" r=\"3\"/>", "mail": "<svg class=\"lucide lucide-mail\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/>", "chevron-left": "<svg class=\"lucide lucide-chevron-left\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m15 18-6-6 6-6\"/>", "chevron-right": "<svg class=\"lucide lucide-chevron-right\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"m9 18 6-6-6-6\"/>", "share-2": "<svg class=\"lucide lucide-share-2\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"18\" cy=\"5\" r=\"3\"/> <circle cx=\"6\" cy=\"12\" r=\"3\"/> <circle cx=\"18\" cy=\"19\" r=\"3\"/> <line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"/> <line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"/>", "bell": "<svg class=\"lucide lucide-bell\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>", "house": "<svg class=\"lucide lucide-house\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "compass": "<svg class=\"lucide lucide-compass\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"/>", "plus": "<svg class=\"lucide lucide-plus\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M5 12h14\"/> <path d=\"M12 5v14\"/>", "user": "<svg class=\"lucide lucide-user\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/> <circle cx=\"12\" cy=\"7\" r=\"4\"/>", "flag": "<svg class=\"lucide lucide-flag\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\"/>", "book-open": "<svg class=\"lucide lucide-book-open\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12 5v16\"/> <path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"/>", "message-square-text": "<svg class=\"lucide lucide-message-square-text\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/> <path d=\"M7 11h10\"/> <path d=\"M7 15h6\"/> <path d=\"M7 7h8\"/>", "x": "<svg class=\"lucide lucide-x\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M18 6 6 18\"/> <path d=\"m6 6 12 12\"/>", "send": "<svg class=\"lucide lucide-send\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"/> <path d=\"m21.854 2.147-10.94 10.939\"/>", "image": "<svg class=\"lucide lucide-image\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/> <circle cx=\"9\" cy=\"9\" r=\"2\"/> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>", "pen-tool": "<svg class=\"lucide lucide-pen-tool\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z\"/> <path d=\"m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18\"/> <path d=\"m2.3 2.3 7.286 7.286\"/> <circle cx=\"11\" cy=\"11\" r=\"2\"/>", "layers": "<svg class=\"lucide lucide-layers\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\"/> <path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\"/> <path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\"/>", "shield-check": "<svg class=\"lucide lucide-shield-check\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/> <path d=\"m9 12 2 2 4-4\"/>", "eye-off": "<svg class=\"lucide lucide-eye-off\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/> <path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/> <path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/> <path d=\"m2 2 20 20\"/>", "settings": "<svg class=\"lucide lucide-settings\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/> <circle cx=\"12\" cy=\"12\" r=\"3\"/>", "mic": "<svg class=\"lucide lucide-mic\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z\"/> <path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/> <line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/>", "volume-2": "<svg class=\"lucide lucide-volume-2\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/> <path d=\"M16 9a5 5 0 0 1 0 6\"/> <path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>", "volume-x": "<svg class=\"lucide lucide-volume-x\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" > <path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/> <line x1=\"22\" x2=\"16\" y1=\"9\" y2=\"15\"/> <line x1=\"16\" x2=\"22\" y1=\"9\" y2=\"15\"/>"};
  var LOGOS = {"horizontal": {"svg": "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 581 125\"><path fill=\"currentColor\" d=\"M6.3 86V60H14.78Q19.01 60 22.11 61.68Q25.22 63.35 26.93 66.28Q28.64 69.21 28.64 72.98Q28.64 76.75 26.93 79.7Q25.22 82.65 22.11 84.32Q19.01 86 14.78 86ZM11.71 81.29H14.92Q17.47 81.29 19.32 80.26Q21.17 79.23 22.2 77.36Q23.23 75.5 23.23 72.98Q23.23 70.43 22.2 68.59Q21.17 66.74 19.32 65.72Q17.47 64.71 14.92 64.71H11.71Z M35.21 86V60H46.21Q48.89 60 50.81 60.91Q52.73 61.81 53.75 63.51Q54.76 65.2 54.76 67.61Q54.76 69.32 53.82 70.87Q52.87 72.42 50.71 73.47V70.82Q52.77 71.62 53.89 72.74Q55 73.86 55.42 75.16Q55.84 76.47 55.84 77.9Q55.84 81.74 53.29 83.87Q50.74 86 46.21 86ZM40.62 81.29H46.84Q48.48 81.29 49.45 80.35Q50.43 79.4 50.43 77.9Q50.43 76.37 49.45 75.43Q48.48 74.48 46.84 74.48H40.62ZM40.62 69.77H46.59Q47.85 69.77 48.6 69.06Q49.35 68.34 49.35 67.15Q49.35 65.97 48.6 65.25Q47.85 64.54 46.59 64.54H40.62Z M62.41 86V60H72.4Q75.08 60 77.16 60.94Q79.24 61.88 80.42 63.73Q81.61 65.58 81.61 68.31Q81.61 70.96 80.41 72.81Q79.2 74.66 77.12 75.62Q75.05 76.58 72.4 76.58H67.82V86ZM67.82 71.87H72.43Q73.58 71.87 74.42 71.41Q75.26 70.96 75.73 70.16Q76.2 69.35 76.2 68.31Q76.2 67.22 75.73 66.42Q75.26 65.62 74.42 65.17Q73.58 64.71 72.43 64.71H67.82Z\"/><rect x=\"100.8\" y=\"22.0\" width=\"3\" height=\"64.0\" rx=\"1.5\" fill=\"currentColor\" opacity=\".35\"/><path fill=\"currentColor\" d=\"M127.45 86V22H143.35V86Z M158.11 86V22H173.73V86ZM160.93 86V72.91H199.81V86Z M237.75 87.36Q231.64 87.36 226.88 86.15Q222.13 84.93 218.64 82.61Q215.15 80.28 212.87 76.98Q210.59 73.68 209.48 69.56Q208.36 65.44 208.36 60.59V22H224.07V60.11Q224.07 64.76 225.53 67.77Q226.98 70.78 229.99 72.18Q232.99 73.59 237.65 73.59Q242.3 73.59 245.31 72.18Q248.31 70.78 249.77 67.77Q251.22 64.76 251.22 60.11V22H266.84V60.59Q266.84 73.3 259.61 80.33Q252.39 87.36 237.75 87.36Z M306.52 87.36Q300.31 87.36 295.27 86.19Q290.23 85.03 286.54 82.65Q282.86 80.28 280.72 76.59Q278.59 72.91 278.2 68.06L291.87 63.5Q292.16 67.58 294.2 70.29Q296.24 73.01 299.68 74.32Q303.12 75.62 307.39 75.62Q311.46 75.62 314.23 74.61Q316.99 73.59 318.39 71.99Q319.8 70.39 319.8 68.55Q319.8 66.41 317.96 65.01Q316.12 63.6 312.92 62.58Q309.72 61.56 305.45 60.59Q300.6 59.43 295.95 58.07Q291.29 56.72 287.51 54.53Q283.73 52.35 281.55 48.91Q279.36 45.47 279.36 40.23Q279.36 34.32 282.37 29.95Q285.38 25.59 291.19 23.12Q297.01 20.64 305.55 20.64Q313.98 20.64 319.9 23.07Q325.81 25.49 329.01 29.81Q332.21 34.12 332.5 39.84L318.54 43.82Q318.54 41.01 317.62 38.87Q316.7 36.74 315.05 35.33Q313.4 33.93 310.98 33.2Q308.55 32.47 305.45 32.47Q301.76 32.47 299.19 33.35Q296.63 34.22 295.36 35.62Q294.1 37.03 294.1 38.87Q294.1 41.2 296.09 42.7Q298.08 44.21 301.52 45.22Q304.96 46.24 309.13 47.21Q313.3 48.08 317.76 49.39Q322.23 50.7 326.1 52.84Q329.98 54.97 332.36 58.61Q334.73 62.24 334.73 67.77Q334.73 73.68 331.58 78.1Q328.43 82.51 322.13 84.93Q315.83 87.36 306.52 87.36Z M359.67 86V22H375.38V86ZM341.06 34.99V22H394.2V34.99Z M403.62 86V22H430.87Q436.2 22 440.57 22.82Q444.93 23.65 448.28 25.25Q451.62 26.85 453.95 29.13Q456.28 31.41 457.44 34.36Q458.6 37.32 458.6 40.91Q458.6 44.3 457.54 47.02Q456.47 49.73 454.29 51.77Q452.11 53.81 448.81 55.07Q445.51 56.33 441.15 56.91V58.36Q446.68 58.95 449.73 60.84Q452.79 62.73 454.43 65.83Q456.08 68.93 457.34 73.3L461.03 86H443.67L440.86 74.27Q439.99 70.39 438.48 68.25Q436.98 66.12 434.65 65.3Q432.32 64.47 428.83 64.47H419.23V86ZM419.23 52.93H429.8Q435.72 52.93 439.02 50.61Q442.31 48.28 442.31 43.33Q442.31 38.48 439.31 36.16Q436.3 33.83 430.19 33.83H419.23Z M466.28 86 488 22H510.89L532.61 86H515.54L500.22 34.22H498.67L483.35 86ZM479.18 73.98V63.5H522.04V73.98Z\"/><path class=\"il-logo-accent\" d=\"M122.0 106.6 C271.6 99.9 429.7 100.4 549.3 77.0 C438.2 110.5 263.0 113.8 122.0 106.6Z\"/><path class=\"il-logo-accent\" d=\"M559.6 32.9 Q563.1 45.4 575.6 48.9 Q563.1 52.4 559.6 64.9 Q556.0 52.4 543.6 48.9 Q556.0 45.4 559.6 32.9Z\"/></svg>\n", "ratio": 4.648}, "vertical": {"svg": "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 465 161\"><path fill=\"currentColor\" d=\"M174.17 30V8H181.35Q184.92 8 187.55 9.42Q190.18 10.83 191.62 13.32Q193.07 15.8 193.07 18.99Q193.07 22.17 191.62 24.67Q190.18 27.17 187.55 28.58Q184.92 30 181.35 30ZM178.75 26.01H181.46Q183.62 26.01 185.19 25.14Q186.75 24.27 187.62 22.69Q188.49 21.11 188.49 18.99Q188.49 16.83 187.62 15.26Q186.75 13.7 185.19 12.84Q183.62 11.99 181.46 11.99H178.75Z M203.69 30V8H213Q215.27 8 216.89 8.77Q218.52 9.54 219.37 10.97Q220.23 12.4 220.23 14.44Q220.23 15.88 219.43 17.2Q218.64 18.51 216.8 19.4V17.15Q218.55 17.83 219.49 18.78Q220.44 19.72 220.79 20.83Q221.15 21.94 221.15 23.15Q221.15 26.4 218.99 28.2Q216.83 30 213 30ZM208.27 26.01H213.53Q214.92 26.01 215.74 25.22Q216.57 24.42 216.57 23.15Q216.57 21.85 215.74 21.05Q214.92 20.26 213.53 20.26H208.27ZM208.27 16.27H213.32Q214.38 16.27 215.02 15.66Q215.65 15.06 215.65 14.05Q215.65 13.05 215.02 12.44Q214.38 11.84 213.32 11.84H208.27Z M231.77 30V8H240.22Q242.49 8 244.25 8.8Q246 9.59 247.01 11.16Q248.01 12.72 248.01 15.03Q248.01 17.27 246.99 18.84Q245.97 20.4 244.22 21.21Q242.46 22.03 240.22 22.03H236.35V30ZM236.35 18.04H240.24Q241.22 18.04 241.93 17.66Q242.64 17.27 243.04 16.59Q243.43 15.91 243.43 15.03Q243.43 14.11 243.04 13.43Q242.64 12.75 241.93 12.37Q241.22 11.99 240.24 11.99H236.35Z\"/><path fill=\"currentColor\" d=\"M10.69 122V58H26.59V122Z M41.35 122V58H56.96V122ZM44.16 122V108.91H83.05V122Z M120.98 123.36Q114.88 123.36 110.12 122.15Q105.37 120.93 101.88 118.61Q98.39 116.28 96.11 112.98Q93.83 109.68 92.72 105.56Q91.6 101.44 91.6 96.59V58H107.31V96.11Q107.31 100.76 108.77 103.77Q110.22 106.78 113.23 108.18Q116.23 109.59 120.89 109.59Q125.54 109.59 128.55 108.18Q131.55 106.78 133.01 103.77Q134.46 100.76 134.46 96.11V58H150.08V96.59Q150.08 109.3 142.85 116.33Q135.63 123.36 120.98 123.36Z M189.76 123.36Q183.55 123.36 178.51 122.19Q173.46 121.03 169.78 118.65Q166.09 116.28 163.96 112.59Q161.83 108.91 161.44 104.06L175.11 99.5Q175.4 103.58 177.44 106.29Q179.48 109.01 182.92 110.32Q186.36 111.62 190.63 111.62Q194.7 111.62 197.46 110.61Q200.23 109.59 201.63 107.99Q203.04 106.39 203.04 104.55Q203.04 102.41 201.2 101.01Q199.36 99.6 196.16 98.58Q192.96 97.56 188.69 96.59Q183.84 95.43 179.19 94.07Q174.53 92.72 170.75 90.53Q166.97 88.35 164.79 84.91Q162.6 81.47 162.6 76.23Q162.6 70.32 165.61 65.95Q168.62 61.59 174.43 59.12Q180.25 56.64 188.79 56.64Q197.22 56.64 203.14 59.07Q209.05 61.49 212.25 65.81Q215.45 70.12 215.74 75.84L201.78 79.82Q201.78 77.01 200.86 74.87Q199.94 72.74 198.29 71.33Q196.64 69.93 194.22 69.2Q191.79 68.47 188.69 68.47Q185 68.47 182.43 69.35Q179.86 70.22 178.6 71.62Q177.34 73.03 177.34 74.87Q177.34 77.2 179.33 78.7Q181.32 80.21 184.76 81.22Q188.2 82.24 192.37 83.21Q196.54 84.08 201 85.39Q205.46 86.7 209.34 88.84Q213.22 90.97 215.6 94.61Q217.97 98.24 217.97 103.77Q217.97 109.68 214.82 114.1Q211.67 118.51 205.37 120.93Q199.06 123.36 189.76 123.36Z M242.91 122V58H258.62V122ZM224.3 70.99V58H277.44V70.99Z M286.86 122V58H314.11Q319.44 58 323.81 58.82Q328.17 59.65 331.52 61.25Q334.86 62.85 337.19 65.13Q339.52 67.41 340.68 70.36Q341.84 73.32 341.84 76.91Q341.84 80.3 340.78 83.02Q339.71 85.73 337.53 87.77Q335.35 89.81 332.05 91.07Q328.75 92.33 324.39 92.91V94.36Q329.92 94.95 332.97 96.84Q336.02 98.73 337.67 101.83Q339.32 104.93 340.58 109.3L344.27 122H326.91L324.1 110.27Q323.22 106.39 321.72 104.25Q320.22 102.12 317.89 101.3Q315.56 100.47 312.07 100.47H302.47V122ZM302.47 88.93H313.04Q318.96 88.93 322.25 86.61Q325.55 84.28 325.55 79.33Q325.55 74.48 322.55 72.16Q319.54 69.83 313.43 69.83H302.47Z M349.52 122 371.24 58H394.13L415.85 122H398.78L383.46 70.22H381.91L366.59 122ZM362.42 109.98V99.5H405.28V109.98Z\"/><path class=\"il-logo-accent\" d=\"M5.3 142.6 C154.8 135.9 312.9 136.4 432.6 113.0 C321.5 146.5 146.3 149.8 5.3 142.6Z\"/><path class=\"il-logo-accent\" d=\"M442.8 68.9 Q446.3 81.4 458.8 84.9 Q446.3 88.4 442.8 100.9 Q439.3 88.4 426.8 84.9 Q439.3 81.4 442.8 68.9Z\"/></svg>\n", "ratio": 2.8882}, "wordmark": {"svg": "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 465 125\"><path fill=\"currentColor\" d=\"M10.69 86V22H26.59V86Z M41.35 86V22H56.96V86ZM44.16 86V72.91H83.05V86Z M120.98 87.36Q114.88 87.36 110.12 86.15Q105.37 84.93 101.88 82.61Q98.39 80.28 96.11 76.98Q93.83 73.68 92.72 69.56Q91.6 65.44 91.6 60.59V22H107.31V60.11Q107.31 64.76 108.77 67.77Q110.22 70.78 113.23 72.18Q116.23 73.59 120.89 73.59Q125.54 73.59 128.55 72.18Q131.55 70.78 133.01 67.77Q134.46 64.76 134.46 60.11V22H150.08V60.59Q150.08 73.3 142.85 80.33Q135.63 87.36 120.98 87.36Z M189.76 87.36Q183.55 87.36 178.51 86.19Q173.46 85.03 169.78 82.65Q166.09 80.28 163.96 76.59Q161.83 72.91 161.44 68.06L175.11 63.5Q175.4 67.58 177.44 70.29Q179.48 73.01 182.92 74.32Q186.36 75.62 190.63 75.62Q194.7 75.62 197.46 74.61Q200.23 73.59 201.63 71.99Q203.04 70.39 203.04 68.55Q203.04 66.41 201.2 65.01Q199.36 63.6 196.16 62.58Q192.96 61.56 188.69 60.59Q183.84 59.43 179.19 58.07Q174.53 56.72 170.75 54.53Q166.97 52.35 164.79 48.91Q162.6 45.47 162.6 40.23Q162.6 34.32 165.61 29.95Q168.62 25.59 174.43 23.12Q180.25 20.64 188.79 20.64Q197.22 20.64 203.14 23.07Q209.05 25.49 212.25 29.81Q215.45 34.12 215.74 39.84L201.78 43.82Q201.78 41.01 200.86 38.87Q199.94 36.74 198.29 35.33Q196.64 33.93 194.22 33.2Q191.79 32.47 188.69 32.47Q185 32.47 182.43 33.35Q179.86 34.22 178.6 35.62Q177.34 37.03 177.34 38.87Q177.34 41.2 179.33 42.7Q181.32 44.21 184.76 45.22Q188.2 46.24 192.37 47.21Q196.54 48.08 201 49.39Q205.46 50.7 209.34 52.84Q213.22 54.97 215.6 58.61Q217.97 62.24 217.97 67.77Q217.97 73.68 214.82 78.1Q211.67 82.51 205.37 84.93Q199.06 87.36 189.76 87.36Z M242.91 86V22H258.62V86ZM224.3 34.99V22H277.44V34.99Z M286.86 86V22H314.11Q319.44 22 323.81 22.82Q328.17 23.65 331.52 25.25Q334.86 26.85 337.19 29.13Q339.52 31.41 340.68 34.36Q341.84 37.32 341.84 40.91Q341.84 44.3 340.78 47.02Q339.71 49.73 337.53 51.77Q335.35 53.81 332.05 55.07Q328.75 56.33 324.39 56.91V58.36Q329.92 58.95 332.97 60.84Q336.02 62.73 337.67 65.83Q339.32 68.93 340.58 73.3L344.27 86H326.91L324.1 74.27Q323.22 70.39 321.72 68.25Q320.22 66.12 317.89 65.3Q315.56 64.47 312.07 64.47H302.47V86ZM302.47 52.93H313.04Q318.96 52.93 322.25 50.61Q325.55 48.28 325.55 43.33Q325.55 38.48 322.55 36.16Q319.54 33.83 313.43 33.83H302.47Z M349.52 86 371.24 22H394.13L415.85 86H398.78L383.46 34.22H381.91L366.59 86ZM362.42 73.98V63.5H405.28V73.98Z\"/><path class=\"il-logo-accent\" d=\"M5.3 106.6 C154.8 99.9 312.9 100.4 432.6 77.0 C321.5 110.5 146.3 113.8 5.3 106.6Z\"/><path class=\"il-logo-accent\" d=\"M442.8 32.9 Q446.3 45.4 458.8 48.9 Q446.3 52.4 442.8 64.9 Q439.3 52.4 426.8 48.9 Q439.3 45.4 442.8 32.9Z\"/></svg>\n", "ratio": 3.72}, "mark": {"svg": "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path class=\"il-logo-accent\" d=\"M226 206 C262 196 300 196 318 204 C308 280 300 350 292 420 C268 432 238 430 214 418 C222 350 226 280 226 206Z\"/><path class=\"il-logo-accent\" d=\"M200 404 C260 446 330 438 392 380 C352 440 280 468 198 424Z\"/><path class=\"il-logo-accent\" d=\"M274.0 64.0 Q288.1 113.9 338.0 128.0 Q288.1 142.1 274.0 192.0 Q259.9 142.1 210.0 128.0 Q259.9 113.9 274.0 64.0Z\"/></svg>\n", "ratio": 1.0}, "appIcon": {"svg": "<svg aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><rect width=\"512\" height=\"512\" rx=\"112\" fill=\"#5b2bd9\"/><path fill=\"#ffffff\" d=\"M226 206 C262 196 300 196 318 204 C308 280 300 350 292 420 C268 432 238 430 214 418 C222 350 226 280 226 206Z\"/><path fill=\"#ffffff\" d=\"M200 404 C260 446 330 438 392 380 C352 440 280 468 198 424Z\"/><path fill=\"#ffc83d\" d=\"M274.0 64.0 Q288.1 113.9 338.0 128.0 Q288.1 142.1 274.0 192.0 Q259.9 142.1 210.0 128.0 Q259.9 113.9 274.0 64.0Z\"/></svg>\n", "ratio": 1.0}};

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(" ");
  }
  function omit(o, keys) {
    var r = {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && keys.indexOf(k) < 0) r[k] = o[k];
    return r;
  }
  var NF = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }) : null;
  function fmt(n) {
    if (n == null) return "";
    return NF ? NF.format(n) : String(n);
  }

  function link(as, href, attrs, children) {
    if (as) return h(as, Object.assign({ to: href }, attrs), children);
    return h("a", Object.assign({ href: href }, attrs), children);
  }

  /* ---------- helpers: sample artwork (placeholder only) ---------- */
  var ART_PALETTES = [
    ["#5b2bd9", "#ffc83d", "#fdf6ea", "#1c1b22"],
    ["#ff6b5b", "#1c1b22", "#fff2cc", "#6cc4f0"],
    ["#6cc4f0", "#5b2bd9", "#f4f1ff", "#ff6b5b"],
    ["#1c1b22", "#ffc83d", "#ece6fc", "#ff6b5b"],
    ["#ffc83d", "#5b2bd9", "#1c1b22", "#fdf6ea"],
    ["#e0f2fb", "#1c1b22", "#ff6b5b", "#5b2bd9"]
  ];
  function rng(seed) {
    var s = (seed * 9301 + 49297) % 233280;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }
  function demoArt(seed, w, hgt) {
    seed = seed || 1; w = w || 600; hgt = hgt || 800;
    var r = rng(seed), p = ART_PALETTES[seed % ART_PALETTES.length];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + hgt + '" preserveAspectRatio="xMidYMid slice">';
    s += '<rect width="' + w + '" height="' + hgt + '" fill="' + p[2] + '"/>';
    s += '<circle cx="' + (w * (0.3 + r() * 0.4)) + '" cy="' + (hgt * (0.25 + r() * 0.3)) + '" r="' + (Math.min(w, hgt) * (0.22 + r() * 0.15)) + '" fill="' + p[0] + '"/>';
    s += '<rect x="' + (w * r() * 0.5) + '" y="' + (hgt * (0.55 + r() * 0.2)) + '" width="' + (w * (0.4 + r() * 0.4)) + '" height="' + (hgt * 0.5) + '" rx="' + (w * 0.04) + '" fill="' + p[1] + '"/>';
    s += '<circle cx="' + (w * (0.6 + r() * 0.3)) + '" cy="' + (hgt * (0.6 + r() * 0.2)) + '" r="' + (Math.min(w, hgt) * 0.08) + '" fill="' + p[3] + '"/>';
    var y0 = hgt * (0.35 + r() * 0.3);
    s += '<path d="M' + (w * 0.08) + " " + y0 + " C" + (w * 0.35) + " " + (y0 - hgt * 0.18) + " " + (w * 0.6) + " " + (y0 + hgt * 0.2) + " " + (w * 0.92) + " " + (y0 - hgt * 0.05) + '" fill="none" stroke="' + p[3] + '" stroke-width="' + (w * 0.018) + '" stroke-linecap="round"/>';
    s += "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  }

  /* ---------- Icon ---------- */
  function Icon(props) {
    var size = props.size || 20;
    var body = ICONS[props.name] || "";
    return h("svg", {
      className: cx("il-icon", props.filled && "il-icon-filled", props.className),
      width: size, height: size, viewBox: "0 0 24 24", fill: props.filled ? "currentColor" : "none",
      stroke: "currentColor", strokeWidth: props.strokeWidth || 1.75, strokeLinecap: "round", strokeLinejoin: "round",
      "aria-hidden": props.label ? undefined : true, role: props.label ? "img" : undefined, "aria-label": props.label,
      dangerouslySetInnerHTML: { __html: body }
    });
  }

  /* ---------- Logo ---------- */
  function Logo(props) {
    var v = props.variant || "horizontal";
    var L = LOGOS[v] || LOGOS.horizontal;
    var height = props.height || (v === "mark" || v === "appIcon" ? 40 : 32);
    return h("span", {
      className: cx("il-logo", "il-logo-" + v, props.reverse && "il-logo-reverse", props.className),
      role: "img", "aria-label": v === "wordmark" || v === "mark" || v === "appIcon" ? "Ilustra" : "DBP Ilustra",
      style: { height: height, width: height * L.ratio },
      dangerouslySetInnerHTML: { __html: L.svg }
    });
  }

  /* ---------- Button ---------- */
  function Button(props) {
    var variant = props.variant || "primary";
    var label = props.children;
    if (variant === "follow") label = props.active ? (props.activeLabel || "Siguiendo") : (props.children || "Seguir");
    var icon = props.icon;
    if (variant === "follow" && !icon) icon = props.active ? "check" : "user-plus";
    var rest = omit(props, ["variant", "size", "icon", "iconRight", "active", "activeLabel", "children", "className", "block"]);
    return h("button", Object.assign({ type: "button" }, rest, {
      className: cx("il-btn", "il-btn-" + variant, "il-btn-" + (props.size || "md"), props.active && "is-active", props.block && "il-btn-block", !label && "il-btn-icononly", props.className),
      "aria-pressed": variant === "follow" ? !!props.active : props["aria-pressed"]
    }), icon ? h(Icon, { name: icon, size: props.size === "sm" ? 16 : 18 }) : null, label ? h("span", null, label) : null,
      props.iconRight ? h(Icon, { name: props.iconRight, size: props.size === "sm" ? 16 : 18 }) : null);
  }

  /* ---------- CategoryTag ---------- */
  var CATEGORIES = {
    ilustracion: "Ilustración", comic: "Cómic", manga: "Manga", historieta: "Historieta", boceto: "Boceto", dbp: "Proyecto DBP"
  };
  function CategoryTag(props) {
    var c = props.category || "ilustracion";
    return h("span", { className: cx("il-tag", "il-tag-" + c, props.className) }, props.children || CATEGORIES[c] || c);
  }

  /* ---------- Avatar ---------- */
  function Avatar(props) {
    var size = props.size || 40;
    var initials = (props.name || "?").split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase();
    return h("span", {
      className: cx("il-avatar", props.ring && "il-avatar-ring", props.className),
      style: { width: size, height: size, fontSize: Math.round(size * 0.38) },
      title: props.name
    }, props.src ? h("span", { className: "il-avatar-img", style: { backgroundImage: "url(\"" + props.src + "\")" }, role: "img", "aria-label": props.name }) : initials);
  }

  /* ---------- SearchField ---------- */
  function SearchField(props) {
    var rest = omit(props, ["className", "placeholder", "size"]);
    return h("label", { className: cx("il-search", props.size === "lg" && "il-search-lg", props.className) },
      h(Icon, { name: "search", size: 18 }),
      h("input", Object.assign({ type: "search", placeholder: props.placeholder || "Buscar artistas, obras, cómics…", "aria-label": "Buscar" }, rest)));
  }

  /* ---------- ProtectedImage ---------- */
  function block(e) { e.preventDefault(); return false; }
  function ProtectedImage(props) {
    var ratio = props.ratio || 1;
    var style = Object.assign({}, props.fill ? { height: "100%" } : { paddingTop: (100 / ratio) + "%" }, props.style || {});
    return h("div", {
      className: cx("il-protected", props.rounded !== false && "il-protected-rounded", props.className),
      style: style, onContextMenu: block, onDragStart: block, role: "img", "aria-label": props.alt || ""
    },
      h("div", { className: "il-protected-img", style: { backgroundImage: "url(\"" + props.src + "\")" } }),
      props.watermark ? h("div", { className: "il-protected-mark", "aria-hidden": true }, h("span", null, props.watermark)) : null,
      h("div", { className: "il-protected-shield", "aria-hidden": true }),
      props.children);
  }

  /* ---------- ArtworkCard ---------- */
  function ArtworkCard(props) {
    var a = props.artist || {};
    return h("article", { className: cx("il-card", props.className) },
      h("div", { className: "il-card-media", onClick: props.onOpen },
        h(ProtectedImage, { src: props.image, ratio: props.ratio || 0.8, alt: props.title, rounded: false, watermark: props.watermark }),
        h("button", {
          type: "button", className: cx("il-card-save", props.saved && "is-active"), "aria-pressed": !!props.saved,
          "aria-label": props.saved ? "Quitar de guardados" : "Guardar", onClick: function (e) { e.stopPropagation(); props.onSave && props.onSave(); }
        }, h(Icon, { name: "bookmark", size: 18, filled: props.saved }))),
      h("div", { className: "il-card-body" },
        props.title ? h("h3", { className: "il-card-title" }, props.title) : null,
        h("div", { className: "il-card-artist", onClick: props.onArtist, role: props.onArtist ? "link" : undefined, style: props.onArtist ? { cursor: "pointer" } : undefined }, h(Avatar, { src: a.avatar, name: a.name, size: 24 }), h("span", null, a.name)),
        h("div", { className: "il-card-foot" },
          props.category ? h(CategoryTag, { category: props.category }) : h("span"),
          h("div", { className: "il-card-stats" },
            h("button", { type: "button", className: cx("il-stat", props.liked && "is-liked"), "aria-pressed": !!props.liked, "aria-label": "Me gusta", onClick: props.onLike },
              h(Icon, { name: "heart", size: 16, filled: props.liked }), h("span", null, fmt(props.likes))),
            h("span", { className: "il-stat", "aria-label": "Comentarios" }, h(Icon, { name: "message-circle", size: 16 }), h("span", null, fmt(props.comments)))))));
  }

  /* ---------- MasonryGrid ---------- */
  function MasonryGrid(props) {
    return h("div", { className: cx("il-masonry", props.className), style: props.columns ? { columnCount: props.columns } : undefined },
      React.Children.map(props.children, function (c) { return h("div", { className: "il-masonry-item" }, c); }));
  }

  /* ---------- ArtistCard ---------- */
  function ArtistCard(props) {
    var works = props.works || [];
    return h("article", { className: "il-artist" },
      h("div", { className: "il-artist-thumbs" }, [0, 1, 2].map(function (i) {
        return works[i]
          ? h(ProtectedImage, { key: i, src: works[i], ratio: 1, rounded: false })
          : h("div", { key: i, className: "il-artist-thumb-empty" });
      })),
      h("div", { className: "il-artist-body" },
        h(Avatar, { src: props.avatar, name: props.name, size: 56, ring: true }),
        h("div", { className: "il-artist-name" }, props.name),
        h("div", { className: "il-artist-handle" }, props.handle),
        h("div", { className: "il-artist-tags" }, (props.disciplines || []).map(function (d) { return h(CategoryTag, { key: d, category: d }); })),
        h(Button, { variant: "follow", size: "sm", active: props.following, onClick: props.onFollow, block: true })));
  }

  /* ---------- Stroke (brand gesture) ---------- */
  function Stroke(props) {
    return h("svg", { className: cx("il-stroke", props.className), viewBox: "0 0 300 24", preserveAspectRatio: "none", "aria-hidden": true },
      h("path", { d: "M2 16 C80 4 180 2 298 6 C200 10 100 16 4 22 Z" }));
  }

  /* ---------- Hero ---------- */
  function Hero(props) {
    var works = props.works || [];
    return h("section", { className: "il-hero" },
      h("div", { className: "il-hero-text" },
        h("div", { className: "il-overline" }, props.overline || "DBP · San Juan, Argentina"),
        h("h1", { className: "il-hero-title" }, props.titleLead || "Descubrí nuevos ", h("span", { className: "il-hero-mark" }, props.titleMark || "trazos", h(Stroke))),
        h("p", { className: "il-hero-sub" }, props.subtitle || "Ilustradores, dibujantes, historietistas y creadores de manga de San Juan."),
        h("div", { className: "il-hero-actions" },
          h(Button, { size: "lg", onClick: props.onPrimary }, props.primaryLabel || "Explorar artistas"),
          props.secondaryLabel ? h(Button, { size: "lg", variant: "secondary", onClick: props.onSecondary }, props.secondaryLabel) : null)),
      h("div", { className: "il-hero-art" }, works.slice(0, 4).map(function (w, i) {
        return h("figure", { key: i, className: "il-hero-piece il-hero-piece-" + (i + 1) },
          h(ProtectedImage, { src: w.image, ratio: w.ratio || 0.8, alt: w.title }),
          w.artist ? h("figcaption", null, w.artist) : null);
      })));
  }

  /* ---------- Tabs ---------- */
  function Tabs(props) {
    return h("div", { className: "il-tabs", role: "tablist" }, (props.items || []).map(function (it) {
      var id = it.id || it.label, on = id === props.active;
      return h("button", { key: id, type: "button", role: "tab", "aria-selected": on, className: cx("il-tab", on && "is-active"), onClick: function () { props.onChange && props.onChange(id); } },
        h("span", null, it.label), it.count != null ? h("span", { className: "il-tab-count" }, fmt(it.count)) : null, on ? h(Stroke) : null);
    }));
  }

  /* ---------- ProfileHeader ---------- */
  function ProfileHeader(props) {
    var s = props.stats || {};
    var accent = props.accent || "violet";
    return h("header", { className: cx("il-profile", "il-accent-" + accent) },
      h("div", { className: "il-profile-cover" }, props.cover ? h(ProtectedImage, { src: props.cover, fill: true, rounded: false }) : null),
      h("div", { className: "il-profile-main" },
        h(Avatar, { src: props.avatar, name: props.name, size: 112, ring: true, className: "il-profile-avatar" }),
        h("div", { className: "il-profile-id" },
          h("h1", { className: "il-profile-name" }, props.name, h(Stroke)),
          h("div", { className: "il-profile-handle" }, props.handle, props.location ? h("span", { className: "il-profile-loc" }, h(Icon, { name: "map-pin", size: 14 }), props.location) : null),
          props.bio ? h("p", { className: "il-profile-bio" }, props.bio) : null,
          h("div", { className: "il-profile-tags" }, (props.disciplines || []).map(function (d) { return h(CategoryTag, { key: d, category: d }); }))),
        h("div", { className: "il-profile-side" },
          h("div", { className: "il-profile-stats" },
            h("div", null, h("strong", null, fmt(s.works)), h("span", null, "Obras")),
            h("div", null, h("strong", null, fmt(s.followers)), h("span", null, "Seguidores")),
            h("div", null, h("strong", null, fmt(s.following)), h("span", null, "Siguiendo"))),
          h("div", { className: "il-profile-actions" },
            h(Button, { variant: "follow", active: props.following, onClick: props.onFollow }),
            h(Button, { variant: "secondary", icon: "mail", onClick: props.onContact }, "Contacto")))),
      props.tabs ? h(Tabs, { items: props.tabs, active: props.activeTab, onChange: props.onTab }) : null);
  }

  /* ---------- ReaderBar ---------- */
  function ReaderBar(props) {
    var p = Math.max(0, Math.min(100, props.progress || 0));
    return h("div", { className: "il-reader-bar" },
      h("div", { className: "il-reader-row" },
        h("button", { type: "button", className: "il-iconbtn", "aria-label": "Volver", onClick: props.onBack }, h(Icon, { name: "chevron-left", size: 22 })),
        h("div", { className: "il-reader-titles" },
          h("div", { className: "il-reader-series" }, props.series, props.category ? h(CategoryTag, { category: props.category }) : null),
          h("div", { className: "il-reader-chapter" }, "Cap. " + props.chapter + (props.title ? " · " + props.title : ""), props.author ? h("span", null, " — " + props.author) : null)),
        h(Button, { variant: "follow", size: "sm", active: props.following, onClick: props.onFollow })),
      h("div", { className: "il-progress", role: "progressbar", "aria-valuenow": p, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Progreso de lectura" },
        h("div", { style: { width: p + "%" } })));
  }

  /* ---------- ChapterNav ---------- */
  function ChapterNav(props) {
    return h("nav", { className: "il-chapnav", "aria-label": "Capítulos" },
      h(Button, { variant: "secondary", icon: "chevron-left", disabled: !props.prev, onClick: props.onPrev }, props.prev ? "Cap. " + props.prev : "Anterior"),
      h("div", { className: "il-chapnav-mid" },
        h("button", { type: "button", className: cx("il-stat il-stat-lg", props.liked && "is-liked"), "aria-pressed": !!props.liked, onClick: props.onLike }, h(Icon, { name: "heart", size: 20, filled: props.liked }), h("span", null, fmt(props.likes))),
        h("span", { className: "il-stat il-stat-lg" }, h(Icon, { name: "message-circle", size: 20 }), h("span", null, fmt(props.comments))),
        h("button", { type: "button", className: "il-stat il-stat-lg", onClick: props.onShare, "aria-label": "Compartir" }, h(Icon, { name: "share-2", size: 20 }))),
      h(Button, { variant: props.next ? "primary" : "secondary", disabled: !props.next, onClick: props.onNext, iconRight: "chevron-right" }, props.next ? "Cap. " + props.next : "Siguiente"));
  }

  /* ---------- CommentItem ---------- */
  function CommentItem(props) {
    var a = props.author || {};
    return h("div", { className: cx("il-comment", props.nested && "il-comment-nested") },
      h(Avatar, { src: a.avatar, name: a.name, size: props.nested ? 28 : 36 }),
      h("div", { className: "il-comment-body" },
        h("div", { className: "il-comment-head" },
          h("span", { className: "il-comment-name" }, a.name),
          props.isArtist ? h("span", { className: "il-badge" }, "Artista") : null,
          h("span", { className: "il-comment-time" }, props.time)),
        h("p", { className: "il-comment-text" }, props.text),
        h("div", { className: "il-comment-actions" },
          h("button", { type: "button", className: cx("il-stat", props.liked && "is-liked"), "aria-pressed": !!props.liked, onClick: props.onLike }, h(Icon, { name: "heart", size: 15, filled: props.liked }), h("span", null, fmt(props.likes))),
          h("button", { type: "button", className: "il-linkbtn", onClick: props.onReply }, "Responder")),
        props.children ? h("div", { className: "il-comment-replies" }, props.children) : null));
  }

  /* ---------- CommentComposer ---------- */
  function CommentComposer(props) {
    if (!props.user) {
      return h("div", { className: "il-composer il-composer-guest" },
        h("div", null, h("div", { className: "il-composer-title" }, "Sumate a la conversación"),
          h("div", { className: "il-composer-note" }, "Iniciá sesión con tu cuenta de Google para comentar, dar me gusta y seguir artistas.")),
        props.signIn || h(Button, { variant: "secondary", onClick: props.onSignIn }, "Continuar con Google"));
    }
    return h("div", { className: "il-composer" },
      h(Avatar, { src: props.user.avatar, name: props.user.name, size: 36 }),
      h("div", { className: "il-composer-field" },
        h("textarea", { rows: 2, placeholder: props.placeholder || "Escribí un comentario…", "aria-label": "Comentario", value: props.value, onChange: props.onChange }),
        h("div", { className: "il-composer-foot" }, h("span", { className: "il-composer-note" }, "Respetá las normas de la comunidad."), h(Button, { size: "sm", onClick: props.onSubmit }, "Publicar"))));
  }

  /* ---------- NavBar ---------- */
  var NAV = [["descubrir", "Descubrir", "/descubrir"], ["artistas", "Artistas", "/artistas"], ["ilustraciones", "Ilustraciones", "/categoria/ilustracion"], ["comics", "Cómics", "/categoria/comic"], ["manga", "Manga", "/categoria/manga"], ["historieta", "Historieta", "/categoria/historieta"], ["comunidad", "Comunidad", "/comunidad"]];
  function NavBar(props) {
    var u = props.user;
    return h("header", { className: "il-nav" },
      link(props.linkAs, props.homeHref || "/", { className: "il-nav-brand", "aria-label": "DBP Ilustra, inicio" }, h(Logo, { height: 34 })),
      h("nav", { className: "il-nav-links", "aria-label": "Principal" }, (props.items || NAV).map(function (it) {
        return link(props.linkAs, it[2] || "#" + it[0], { key: it[0], className: cx("il-nav-link", props.active === it[0] && "is-active"), "aria-current": props.active === it[0] ? "page" : undefined }, it[1]);
      })),
      h("div", { className: "il-nav-tools" },
        h("form", { className: "il-nav-search", role: "search", onSubmit: function (e) { e.preventDefault(); var q = e.target.elements.q; props.onSearch && props.onSearch(q ? q.value : ""); } },
          h(SearchField, { name: "q", placeholder: "Buscar…" })),
        h("button", { type: "button", className: "il-iconbtn il-nav-searchbtn", "aria-label": "Buscar", onClick: function () { props.onSearch && props.onSearch(null); } }, h(Icon, { name: "search", size: 20 })),
        u ? h("button", { type: "button", className: "il-iconbtn", onClick: props.onNotifications, "aria-label": "Notificaciones" + (props.unread ? " (" + props.unread + " nuevas)" : "") },
          h(Icon, { name: "bell", size: 20 }), props.unread ? h("span", { className: "il-dot" }) : null) : null,
        props.extra || null,
        u ? h("button", { type: "button", className: "il-nav-user", onClick: props.onUser, "aria-label": "Mi cuenta" }, h(Avatar, { src: u.avatar, name: u.name, size: 36 }))
          : (props.signIn || h(Button, { size: "sm", variant: "secondary", onClick: props.onSignIn }, "Ingresar"))));
  }

  /* ---------- BottomNav ---------- */
  var BOTTOM = [["inicio", "Inicio", "house", "/"], ["descubrir", "Descubrir", "compass", "/descubrir"], ["publicar", "Publicar", "plus", "/publicar"], ["alertas", "Alertas", "bell", "/notificaciones"], ["perfil", "Perfil", "user", "/yo"]];
  function BottomNav(props) {
    return h("nav", { className: "il-bottomnav", "aria-label": "Navegación" }, BOTTOM.map(function (it) {
      var on = props.active === it[0];
      return link(props.linkAs, (props.hrefs && props.hrefs[it[0]]) || it[3], { key: it[0], className: cx("il-bottomnav-item", on && "is-active", it[0] === "publicar" && "il-bottomnav-publish"), "aria-current": on ? "page" : undefined },
        [h("span", { key: "i", className: "il-bottomnav-icon" }, h(Icon, { name: it[2], size: 22 }), it[0] === "alertas" && props.unread ? h("span", { className: "il-dot" }) : null),
        h("span", { key: "l", className: "il-bottomnav-label" }, it[1])]);
    }));
  }

  /* ---------- NotificationItem ---------- */
  var NOTI = { like: ["heart", "Le gustó tu obra"], comment: ["message-circle", "Comentó"], follow: ["user-plus", "Empezó a seguirte"], dbp: ["flag", "DBP"], chapter: ["book-open", "Nuevo capítulo"] };
  function NotificationItem(props) {
    var t = NOTI[props.type] || NOTI.like;
    var a = props.actor || {};
    return h("div", { className: cx("il-noti", props.unread && "is-unread") },
      h("span", { className: "il-noti-avatar" }, h(Avatar, { src: a.avatar, name: a.name, size: 40 }), h("span", { className: "il-noti-type il-noti-" + (props.type || "like") }, h(Icon, { name: t[0], size: 12, strokeWidth: 2.25, filled: props.type === "like" }))),
      h("div", { className: "il-noti-body" },
        h("div", { className: "il-noti-text" }, h("strong", null, a.name), " ", props.text || t[1].toLowerCase()),
        h("div", { className: "il-noti-time" }, props.time)),
      props.thumb ? h("span", { className: "il-noti-thumb", style: { backgroundImage: "url(\"" + props.thumb + "\")" } }) : null,
      props.unread ? h("span", { className: "il-dot il-dot-inline", "aria-label": "Sin leer" }) : null);
  }

  /* ---------- AssistantPanel ---------- */
  function AssistantPanel(props) {
    return h("section", { className: "il-assistant", "aria-label": "Asistente Ilustra" },
      h("header", { className: "il-assistant-head" },
        h("span", { className: "il-assistant-icon" }, h(Icon, { name: "message-square-text", size: 18 })),
        h("div", null, h("div", { className: "il-assistant-title" }, "Asistente Ilustra"), h("div", { className: "il-assistant-sub" }, "Respuestas generadas con IA · pueden contener errores")),
        props.showVoiceToggle ? h("button", { type: "button", className: "il-iconbtn" + (props.voiceOn ? " is-on" : ""), "aria-label": props.voiceOn ? "Desactivar lectura en voz alta" : "Activar lectura en voz alta", "aria-pressed": !!props.voiceOn, onClick: props.onToggleVoice }, h(Icon, { name: props.voiceOn ? "volume-2" : "volume-x", size: 18 })) : null,
        h("button", { type: "button", className: "il-iconbtn", "aria-label": "Cerrar", onClick: props.onClose }, h(Icon, { name: "x", size: 18 }))),
      h("div", { className: "il-assistant-log" }, (props.messages || []).map(function (m, i) {
        return h("div", { key: i, className: "il-msg il-msg-" + (m.from === "user" ? "user" : "bot") }, m.text);
      })),
      props.suggestions && props.suggestions.length ? h("div", { className: "il-assistant-sugg" }, props.suggestions.map(function (s) {
        return h("button", { key: s, type: "button", className: "il-chip", onClick: function () { props.onSuggestion && props.onSuggestion(s); } }, s);
      })) : null,
      h("form", { className: "il-assistant-input", onSubmit: function (e) { e.preventDefault(); props.onSend && props.onSend(); } },
        props.showMic ? h("button", { type: "button", className: "il-iconbtn il-mic-btn" + (props.micOn ? " is-listening" : ""), "aria-label": props.micOn ? "Detener grabación" : "Hablarle al asistente", "aria-pressed": !!props.micOn, onClick: props.onMic }, h(Icon, { name: "mic", size: 18 })) : null,
        h("input", { type: "text", placeholder: props.micOn ? "Escuchando…" : "Preguntá sobre artistas, obras o el sitio…", "aria-label": "Mensaje al asistente", value: props.value, onChange: props.onChange }),
        h("button", { type: "submit", className: "il-btn il-btn-primary il-btn-sm il-btn-icononly", "aria-label": "Enviar" }, h(Icon, { name: "send", size: 16 }))));
  }

  /* ---------- SectionHeader ---------- */
  function SectionHeader(props) {
    return h("div", { className: "il-section-head" },
      h("div", null, props.overline ? h("div", { className: "il-overline" }, props.overline) : null, h("h2", { className: "il-section-title" }, props.title)),
      props.action ? link(props.linkAs, props.href || "#", { className: "il-section-action" }, props.action) : null);
  }

  /* ---------- ScrollRow ---------- */
  function ScrollRow(props) {
    return h("div", { className: "il-scrollrow", style: props.itemWidth ? { "--il-row-item": props.itemWidth + "px" } : undefined },
      React.Children.map(props.children, function (c) { return h("div", { className: "il-scrollrow-item" }, c); }));
  }

  /* ---------- ArtworkViewer ---------- */
  function ArtworkViewer(props) {
    var a = props.artist || {};
    return h("article", { className: "il-viewer" },
      h("div", { className: "il-viewer-stage" },
        h("div", { className: "il-viewer-frame", style: { maxWidth: props.ratio ? "min(100%, calc(" + props.ratio + " * 78vh))" : undefined } },
          h(ProtectedImage, { src: props.image, ratio: props.ratio || 0.8, alt: props.title, watermark: props.watermark }))),
      h("aside", { className: "il-viewer-side" },
        h("div", { className: "il-viewer-artist" },
          h("span", { onClick: props.onArtist, style: { cursor: props.onArtist ? "pointer" : undefined, display: "flex", alignItems: "center", gap: 12, minWidth: 0 } },
            h(Avatar, { src: a.avatar, name: a.name, size: 44 }),
            h("span", { className: "il-viewer-who" }, h("strong", null, a.name), h("span", null, a.handle))),
          props.own ? null : h(Button, { variant: "follow", size: "sm", active: props.following, onClick: props.onFollow })),
        h("h1", { className: "il-viewer-title" }, props.title),
        h("div", { className: "il-viewer-meta" }, props.category ? h(CategoryTag, { category: props.category }) : null, props.date ? h("span", null, props.date) : null),
        props.description ? h("p", { className: "il-viewer-desc" }, props.description) : null,
        props.tags && props.tags.length ? h("div", { className: "il-viewer-tags" }, props.tags.map(function (t) { return h("span", { key: t }, "#" + t); })) : null,
        h("div", { className: "il-viewer-actions" },
          h("button", { type: "button", className: cx("il-stat il-stat-lg", props.liked && "is-liked"), "aria-pressed": !!props.liked, onClick: props.onLike }, h(Icon, { name: "heart", size: 20, filled: props.liked }), h("span", null, fmt(props.likes))),
          h("span", { className: "il-stat il-stat-lg" }, h(Icon, { name: "message-circle", size: 20 }), h("span", null, fmt(props.comments))),
          h("span", { className: "il-viewer-spacer" }),
          h(Button, { variant: props.saved ? "primary" : "secondary", size: "sm", icon: "bookmark", onClick: props.onSave }, props.saved ? "Guardada" : "Guardar"),
          h("button", { type: "button", className: "il-iconbtn", "aria-label": "Compartir", onClick: props.onShare }, h(Icon, { name: "share-2", size: 20 })),
          props.onReport ? h("button", { type: "button", className: "il-iconbtn", "aria-label": "Reportar", onClick: props.onReport }, h(Icon, { name: "flag", size: 18 })) : null),
        props.children ? h("div", { className: "il-viewer-comments" }, props.children) : null));
  }


export { Logo, Icon, Button, CategoryTag, Avatar, SearchField, ProtectedImage, ArtworkCard, MasonryGrid, ArtistCard, Hero, ProfileHeader, Tabs, ReaderBar, ChapterNav, CommentItem, CommentComposer, NavBar, BottomNav, NotificationItem, AssistantPanel, SectionHeader, ScrollRow, ArtworkViewer, Stroke, demoArt, CATEGORIES };
