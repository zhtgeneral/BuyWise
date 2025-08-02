import '../styles/ExplorePage.css'
import React from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { OrbitProgress } from 'react-loading-indicators'
import Browser from '../utils/browser';

// TODO remove later on
const mockProducts = [
  {
    "id": "13089528601052672663",
    "source": "Best Buy",
    "title": "HP 17.3\" HD+ Laptop",
    "image": "https://serpapi.com/searches/6872d316a1de1244c16bf28d/images/f44dba924dd4116c9f11495dbd0fbfc662b55f2c57f41712aa1e4b0b4d2a306d.webp",
    "price": 579.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621060-b52jeg?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmJlc3RidXkuY29tL3NpdGUvaHAtMTctMy1oZC1sYXB0b3AtaW50ZWwtY29yZS1pMy04Z2ItbWVtb3J5LTI1NmdiLXNzZC1uYXR1cmFsLXNpbHZlci82NjEyOTc4LnA/c2t1SWQ9NjYxMjk3OCIsInBhcmFtcyI6eyJwcm9kdWN0X2lkIjoiMTMwODk1Mjg2MDEwNTI2NzI2NjMiLCJzb3VyY2UiOiJCZXN0IEJ1eSIsInRpdGxlIjoiSFAgMTcuM1wiIEhEKyBMYXB0b3AiLCJwcmljZSI6NTc5Ljk5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy5iZXN0YnV5LmNvbS9zaXRlL2hwLTE3LTMtaGQtbGFwdG9wLWludGVsLWNvcmUtaTMtOGdiLW1lbW9yeS0yNTZnYi1zc2QtbmF0dXJhbC1zaWx2ZXIvNjYxMjk3OC5wP3NrdUlkPTY2MTI5Nzg/cHJvZHVjdF9pZD0xMzA4OTUyODYwMTA1MjY3MjY2MyZzb3VyY2U9QmVzdCtCdXkmdGl0bGU9SFArMTcuMyUyMitIRCUyQitMYXB0b3AmcHJpY2U9NTc5Ljk5IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4.7,
    "reviews": 91
  },
  {
    "id": "17215463292223939006",
    "source": "Best Buy",
    "title": "Lenovo IdeaPad 1 15.6\" Full HD Touchscreen Laptop",
    "image": "https://serpapi.com/searches/6872d316a1de1244c16bf28d/images/f44dba924dd4116c9f11495dbd0fbfc600c5e48cadd48ba315a09c5de4798ff0.webp",
    "price": 579.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621061-u34wdi?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmJlc3RidXkuY29tL3NpdGUvbGVub3ZvLWlkZWFwYWQtMS0xNS02LWZ1bGwtaGQtdG91Y2hzY3JlZW4tbGFwdG9wLWFtZC1yeXplbi01LTc1MjB1LThnYi1tZW1vcnktMjU2Z2Itc3NkLWFieXNzLWJsdWUvNjYxMDg5NC5wP3NrdUlkPTY2MTA4OTQmcmVmPTIxMiZsb2M9MSZ1dG1fc291cmNlPWZlZWQmZXh0U3RvcmVJZD04ODciLCJwYXJhbXMiOnsicHJvZHVjdF9pZCI6IjE3MjE1NDYzMjkyMjIzOTM5MDA2Iiwic291cmNlIjoiQmVzdCBCdXkiLCJ0aXRsZSI6Ikxlbm92byBJZGVhUGFkIDEgMTUuNlwiIEZ1bGwgSEQgVG91Y2hzY3JlZW4gTGFwdG9wIiwicHJpY2UiOjU3OS45OX0sInJlZGlyZWN0VXJsIjoiaHR0cHM6Ly93d3cuYmVzdGJ1eS5jb20vc2l0ZS9sZW5vdm8taWRlYXBhZC0xLTE1LTYtZnVsbC1oZC10b3VjaHNjcmVlbi1sYXB0b3AtYW1kLXJ5emVuLTUtNzUyMHUtOGdiLW1lbW9yeS0yNTZnYi1zc2QtYWJ5c3MtYmx1ZS82NjEwODk0LnA/c2t1SWQ9NjYxMDg5NCZyZWY9MjEyJmxvYz0xJnV0bV9zb3VyY2U9ZmVlZCZleHRTdG9yZUlkPTg4Nz9wcm9kdWN0X2lkPTE3MjE1NDYzMjkyMjIzOTM5MDA2JnNvdXJjZT1CZXN0K0J1eSZ0aXRsZT1MZW5vdm8rSWRlYVBhZCsxKzE1LjYlMjIrRnVsbCtIRCtUb3VjaHNjcmVlbitMYXB0b3AmcHJpY2U9NTc5Ljk5IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4.7,
    "reviews": 259
  },
  {
    "id": "13286968782500825496",
    "source": "Amazon",
    "title": "Laptop Computer 15.6\" Windows 11 8GB RAM 256GB SSD Storage Fingerprint Unlocking N5095 CPU",       
    "image": "https://serpapi.com/searches/6872d316a1de1244c16bf28d/images/f44dba924dd4116c9f11495dbd0fbfc6e69f65c4fed96770fcc89b4c79171a34.webp",
    "price": 209,
    "url": "",
    "rating": 0,
    "reviews": 0
  },
  {
    "id": "15260305028500761209",
    "source": "Amazon.com",
    "title": "Asus Vivobook Go 15.6 Laptop AMD Ryzen 5 7520U",
    "image": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQLx53LbI9vuwtSiq1V951E3IDBfQhk1rSoWAFk_BZePau2oCXatDVHgvhqVmsKwWz56vYVCTjS0UAULLk3RTVA6g8dw_HyLipy-jALvThVfVKyELYauzcxVA",
    "price": 379.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621062-h4uh8m?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmFtYXpvbi5jb20vQVNVUy1WaXZvYm9vay1Qcm9jZXNzb3ItRHVyYWJpbGl0eS1FMTUwNEZBLUFCMzQvZHAvQjBEVFZRTjdLTT9zb3VyY2U9cHMtc2wtc2hvcHBpbmdhZHMtbHBjb250ZXh0JnJlZl89ZnBsZnMmcHNjPTEmc21pZD1BVFZQREtJS1gwREVSIiwicGFyYW1zIjp7InByb2R1Y3RfaWQiOiIxNTI2MDMwNTAyODUwMDc2MTIwOSIsInNvdXJjZSI6IkFtYXpvbi5jb20iLCJ0aXRsZSI6IkFzdXMgVml2b2Jvb2sgR28gMTUuNiBMYXB0b3AgQU1EIFJ5emVuIDUgNzUyMFUiLCJwcmljZSI6Mzc5Ljk5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy5hbWF6b24uY29tL0FTVVMtVml2b2Jvb2stUHJvY2Vzc29yLUR1cmFiaWxpdHktRTE1MDRGQS1BQjM0L2RwL0IwRFRWUU43S00/c291cmNlPXBzLXNsLXNob3BwaW5nYWRzLWxwY29udGV4dCZyZWZfPWZwbGZzJnBzYz0xJnNtaWQ9QVRWUERLSUtYMERFUj9wcm9kdWN0X2lkPTE1MjYwMzA1MDI4NTAwNzYxMjA5JnNvdXJjZT1BbWF6b24uY29tJnRpdGxlPUFzdXMrVml2b2Jvb2srR28rMTUuNitMYXB0b3ArQU1EK1J5emVuKzUrNzUyMFUmcHJpY2U9Mzc5Ljk5IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4.6,
    "reviews": 5300
  },
  {
    "id": "5110225012656709502",
    "source": "Best Buy",
    "title": "Lenovo IdeaPad Slim 3 15IAN8 15.6\" Laptop",
    "image": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTYdXTdj2XpR9-YRi3eNlLGU-GDP4M50aWNXuJhOZhZQ8PhU4e2IlJkdQAyi5f8Qp-VyQCnkcMs6hwPAhxMdZbXZ60VIOl2a0hLXuUEAxiQjvZhafVFNQ0aNA",
    "price": 449.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621064-hu1vvc?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmJlc3RidXkuY29tL3NpdGUvbGVub3ZvLWlkZWFwYWQtc2xpbS0zaS0xNS02LWZ1bGwtaGQtbGFwdG9wLWludGVsLWNvcmUtaTMtbjMwNS04Z2ItbWVtb3J5LTEyOGdiLXVmcy1hcmN0aWMtZ3JleS82NjEwODkxLnA/c2t1SWQ9NjYxMDg5MSIsInBhcmFtcyI6eyJwcm9kdWN0X2lkIjoiNTExMDIyNTAxMjY1NjcwOTUwMiIsInNvdXJjZSI6IkJlc3QgQnV5IiwidGl0bGUiOiJMZW5vdm8gSWRlYVBhZCBTbGltIDMgMTVJQU44IDE1LjZcIiBMYXB0b3AiLCJwcmljZSI6NDQ5Ljk5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy5iZXN0YnV5LmNvbS9zaXRlL2xlbm92by1pZGVhcGFkLXNsaW0tM2ktMTUtNi1mdWxsLWhkLWxhcHRvcC1pbnRlbC1jb3JlLWkzLW4zMDUtOGdiLW1lbW9yeS0xMjhnYi11ZnMtYXJjdGljLWdyZXkvNjYxMDg5MS5wP3NrdUlkPTY2MTA4OTE/cHJvZHVjdF9pZD01MTEwMjI1MDEyNjU2NzA5NTAyJnNvdXJjZT1CZXN0K0J1eSZ0aXRsZT1MZW5vdm8rSWRlYVBhZCtTbGltKzMrMTVJQU44KzE1LjYlMjIrTGFwdG9wJnByaWNlPTQ0OS45OSIsInVzZXJJZCI6IjY4NzI5MGVkYzUwYTJmYzJjMmI0ZThiOSJ9",
    "rating": 4.6,
    "reviews": 1000
  },
  {
    "id": "15218219790880478499",
    "source": "Dell",
    "title": "Dell Inspiron 3535 15.6 inch FHD Touchscreen Laptop AMD Ryzen",
    "image": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTMPbUpl_J6ESnWTyTE38-3PpdBmxx8f-P6cfihzrO6XLe61aVFkah5uBtw4Q54ZI6tI3KvpfLigkhf_miEhd4epIxalqSv6Z5Tb8tespusPLeIQBmURCBp",
    "price": 299.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621065-tgh7wc?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmRlbGwuY29tL2VuLXVzL3Nob3AvY3R5L3BkcC9zcGQvaW5zcGlyb24tMTUtMzUzNS1sYXB0b3AvdXNlaWNoYnRzMzUzNWdyeXg/dGZjaWQ9OTEwNDk3MzUmZGdjPW9wbCZzcnNsdGlkPUFmbUJPb3I3bU1XOFpra1l6Q1FSZ2Q5VUFtc0tBbXdpQXJ5MFV3dUthSEdvSHdES0JiaGVoSGNXQkJBIiwicGFyYW1zIjp7InByb2R1Y3RfaWQiOiIxNTIxODIxOTc5MDg4MDQ3ODQ5OSIsInNvdXJjZSI6IkRlbGwiLCJ0aXRsZSI6IkRlbGwgSW5zcGlyb24gMzUzNSAxNS42IGluY2ggRkhEIFRvdWNoc2NyZWVuIExhcHRvcCBBTUQgUnl6ZW4iLCJwcmljZSI6Mjk5Ljk5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy5kZWxsLmNvbS9lbi11cy9zaG9wL2N0eS9wZHAvc3BkL2luc3Bpcm9uLTE1LTM1MzUtbGFwdG9wL3VzZWljaGJ0czM1MzVncnl4P3RmY2lkPTkxMDQ5NzM1JmRnYz1vcGwmc3JzbHRpZD1BZm1CT29yN21NVzhaa2tZekNRUmdkOVVBbXNLQW13aUFyeTBVd3VLYUhHb0h3REtCYmhlaEhjV0JCQT9wcm9kdWN0X2lkPTE1MjE4MjE5NzkwODgwNDc4NDk5JnNvdXJjZT1EZWxsJnRpdGxlPURlbGwrSW5zcGlyb24rMzUzNSsxNS42K2luY2grRkhEK1RvdWNoc2NyZWVuK0xhcHRvcCtBTUQrUnl6ZW4mcHJpY2U9Mjk5Ljk5IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4.2,
    "reviews": 4800
  },
  {
    "id": "16009140275661884689",
    "source": "Amazon.com - Seller",
    "title": "Acer FHD 15.6\" Aspire Go 15 Laptop",
    "image": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQt03ianTvqsXskt-CKl514vqNalmr3T_p78zoMaMLwadb6C7KoYFy3F-f33maG14B9lukfF9mfITmh6sULxRz1Gz1zZ871nJpz2pAel6Prp6eXMcaPD3ES1Q",
    "price": 295.97,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621066-hnt1qo?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmFtYXpvbi5jb20vRGlzcGxheS1pMy1OMzA1LUdyYXBoaWNzLVdpbmRvd3MtQUcxNS0zMVAtMzk0Ny9kcC9CMENWNVpTUjE3P3NvdXJjZT1wcy1zbC1zaG9wcGluZ2Fkcy1scGNvbnRleHQmcmVmXz1mcGxmcyZwc2M9MSZzbWlkPUEyOUtMUVA3SVVVTEM1IiwicGFyYW1zIjp7InByb2R1Y3RfaWQiOiIxNjAwOTE0MDI3NTY2MTg4NDY4OSIsInNvdXJjZSI6IkFtYXpvbi5jb20gLSBTZWxsZXIiLCJ0aXRsZSI6IkFjZXIgRkhEIDE1LjZcIiBBc3BpcmUgR28gMTUgTGFwdG9wIiwicHJpY2UiOjI5NS45N30sInJlZGlyZWN0VXJsIjoiaHR0cHM6Ly93d3cuYW1hem9uLmNvbS9EaXNwbGF5LWkzLU4zMDUtR3JhcGhpY3MtV2luZG93cy1BRzE1LTMxUC0zOTQ3L2RwL0IwQ1Y1WlNSMTc/c291cmNlPXBzLXNsLXNob3BwaW5nYWRzLWxwY29udGV4dCZyZWZfPWZwbGZzJnBzYz0xJnNtaWQ9QTI5S0xRUDdJVVVMQzU/cHJvZHVjdF9pZD0xNjAwOTE0MDI3NTY2MTg4NDY4OSZzb3VyY2U9QW1hem9uLmNvbSstK1NlbGxlciZ0aXRsZT1BY2VyK0ZIRCsxNS42JTIyK0FzcGlyZStHbysxNStMYXB0b3AmcHJpY2U9Mjk1Ljk3IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4.7,
    "reviews": 482
  },
  {
    "id": "3548693651240132925",
    "source": "Newegg.com - BMAX Official",
    "title": "BMAX S14 14\" Intel Gemini Lake N4100 Laptop",
    "image": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT899sPFVfLgdAawXr62pHQHdsMbiBQH5-StgsZXPFLR-6XkJAB6CKX5of2rAOEjPWBF99Cg7gv6onM9MbtOC-eE2HkLl3KwbWHhgjjpxKdZ-cxRFogFAr3",
    "price": 189,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621068-0m9sab?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3Lm5ld2VnZy5jb20vYm1heC1zMTQtMTQtMC1ub24tdG91Y2gtc2NyZWVuLWludGVsLWNlbGVyb24tbjQxMDAtaW50ZWwtdWhkLWdyYXBoaWNzLTYwMC04Z2ItbWVtb3J5LTI1Ni1nYi1zc2QvcC8xVFMtMDBGVS0wMDAwNj9pdGVtPTlTSUFXN0RGRUEzMDkyJm5tX21jPWtuYy1nb29nbGVhZHdvcmRzJmNtX21tYz1rbmMtZ29vZ2xlYWR3b3Jkcy1fLW5vdGVib29rcy1fLWJtYXgtXy05U0lBVzdERkVBMzA5MiZ1dG1fc291cmNlPWdvb2dsZSZ1dG1fbWVkaXVtPW9yZ2FuaWMrc2hvcHBpbmcmdXRtX2NhbXBhaWduPWtuYy1nb29nbGVhZHdvcmRzLV8tbm90ZWJvb2tzLV8tYm1heC1fLTlTSUFXN0RGRUEzMDkyJnNvdXJjZT1yZWdpb24mc3JzbHRpZD1BZm1CT29xdkNBbmNqS3FhbnpEZmJXQmNOWURNLTFtbm9pd0xaRW5nVzRSYWR6WjlFcmhFZ0FSdG5NOCIsInBhcmFtcyI6eyJwcm9kdWN0X2lkIjoiMzU0ODY5MzY1MTI0MDEzMjkyNSIsInNvdXJjZSI6Ik5ld2VnZy5jb20gLSBCTUFYIE9mZmljaWFsIiwidGl0bGUiOiJCTUFYIFMxNCAxNFwiIEludGVsIEdlbWluaSBMYWtlIE40MTAwIExhcHRvcCIsInByaWNlIjoxODl9LCJyZWRpcmVjdFVybCI6Imh0dHBzOi8vd3d3Lm5ld2VnZy5jb20vYm1heC1zMTQtMTQtMC1ub24tdG91Y2gtc2NyZWVuLWludGVsLWNlbGVyb24tbjQxMDAtaW50ZWwtdWhkLWdyYXBoaWNzLTYwMC04Z2ItbWVtb3J5LTI1Ni1nYi1zc2QvcC8xVFMtMDBGVS0wMDAwNj9pdGVtPTlTSUFXN0RGRUEzMDkyJm5tX21jPWtuYy1nb29nbGVhZHdvcmRzJmNtX21tYz1rbmMtZ29vZ2xlYWR3b3Jkcy1fLW5vdGVib29rcy1fLWJtYXgtXy05U0lBVzdERkVBMzA5MiZ1dG1fc291cmNlPWdvb2dsZSZ1dG1fbWVkaXVtPW9yZ2FuaWMrc2hvcHBpbmcmdXRtX2NhbXBhaWduPWtuYy1nb29nbGVhZHdvcmRzLV8tbm90ZWJvb2tzLV8tYm1heC1fLTlTSUFXN0RGRUEzMDkyJnNvdXJjZT1yZWdpb24mc3JzbHRpZD1BZm1CT29xdkNBbmNqS3FhbnpEZmJXQmNOWURNLTFtbm9pd0xaRW5nVzRSYWR6WjlFcmhFZ0FSdG5NOD9wcm9kdWN0X2lkPTM1NDg2OTM2NTEyNDAxMzI5MjUmc291cmNlPU5ld2VnZy5jb20rLStCTUFYK09mZmljaWFsJnRpdGxlPUJNQVgrUzE0KzE0JTIyK0ludGVsK0dlbWluaStMYWtlK040MTAwK0xhcHRvcCZwcmljZT0xODkiLCJ1c2VySWQiOiI2ODcyOTBlZGM1MGEyZmMyYzJiNGU4YjkifQ==",
    "rating": 4.8,
    "reviews": 24
  },
  {
    "id": "5978019911808061169",
    "source": "Walmart",
    "title": "Lenovo IdeaPad 1 15ada7",
    "image": "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ9l12qdXClRQtXRGka6CSY8u8JD8q_cQRF81Rr0Brm09-JaJOQp88CEeFB5Eajz05XxwZYrixAdlOFuBPAER7hxfH55RFB0rt1qDDidEW5plD9sU4RNXKg",
    "price": 269,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621069-zjkafc?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LndhbG1hcnQuY29tL2lwL0xlbm92by1JZGVhcGFkLTEtMTUtNi1pbmNoLUxhcHRvcC1BTUQtUnl6ZW4tMy03MzIwVS04R0ItUkFNLTI1NkdCLVNTRC1BYnlzcy1CbHVlLzI2NzA0MTQ1NjM/d21sc3BhcnRuZXI9d2xwYSZzZWxlY3RlZFNlbGxlcklkPTAmc2VsZWN0ZWRPZmZlcklkPTFBMUZGRTU2NEI4OTQ4NUQ5RjM2MzJDMEY0NUNDRTFBJmNvbmRpdGlvbkdyb3VwQ29kZT0xIiwicGFyYW1zIjp7InByb2R1Y3RfaWQiOiI1OTc4MDE5OTExODA4MDYxMTY5Iiwic291cmNlIjoiV2FsbWFydCIsInRpdGxlIjoiTGVub3ZvIElkZWFQYWQgMSAxNWFkYTciLCJwcmljZSI6MjY5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy53YWxtYXJ0LmNvbS9pcC9MZW5vdm8tSWRlYXBhZC0xLTE1LTYtaW5jaC1MYXB0b3AtQU1ELVJ5emVuLTMtNzMyMFUtOEdCLVJBTS0yNTZHQi1TU0QtQWJ5c3MtQmx1ZS8yNjcwNDE0NTYzP3dtbHNwYXJ0bmVyPXdscGEmc2VsZWN0ZWRTZWxsZXJJZD0wJnNlbGVjdGVkT2ZmZXJJZD0xQTFGRkU1NjRCODk0ODVEOUYzNjMyQzBGNDVDQ0UxQSZjb25kaXRpb25Hcm91cENvZGU9MT9wcm9kdWN0X2lkPTU5NzgwMTk5MTE4MDgwNjExNjkmc291cmNlPVdhbG1hcnQmdGl0bGU9TGVub3ZvK0lkZWFQYWQrMSsxNWFkYTcmcHJpY2U9MjY5IiwidXNlcklkIjoiNjg3MjkwZWRjNTBhMmZjMmMyYjRlOGI5In0=",
    "rating": 4,
    "reviews": 406
  },
  {
    "id": "17861403473625779245",
    "source": "Amazon.com - Seller",
    "title": "15.6\" School Laptop",
    "image": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRoHMIx-SyGKdOqgq66lur-r7EG3JhlwFzqV6I_lQ8EQFfqLnirY5wEV2b1YENROalvvCPd4zOTDq-Db3u5VznDulrFc09FFjd2oWuXVH7OQpAkL3RCtvfH",
    "price": 199.99,
    "url": "http://localhost:3000/api/buywise/redirect/1752355621069-az4jtb?data=eyJvcmlnaW5hbFVybCI6Imh0dHBzOi8vd3d3LmFtYXpvbi5jb20vWHBhcmtpbi1XaW5kb3dzLUNvbXB1dGVyLUJ1c2luZXNzLTJ4VVNCMy0wL2RwL0IwRDlYUUtSWlE/c291cmNlPXBzLXNsLXNob3BwaW5nYWRzLWxwY29udGV4dCZyZWZfPWZwbGZzJnBzYz0xJnNtaWQ9QTJFSjRSMDBUWERXRzUiLCJwYXJhbXMiOnsicHJvZHVjdF9pZCI6IjE3ODYxNDAzNDczNjI1Nzc5MjQ1Iiwic291cmNlIjoiQW1hem9uLmNvbSAtIFNlbGxlciIsInRpdGxlIjoiMTUuNlwiIFNjaG9vbCBMYXB0b3AiLCJwcmljZSI6MTk5Ljk5fSwicmVkaXJlY3RVcmwiOiJodHRwczovL3d3dy5hbWF6b24uY29tL1hwYXJraW4tV2luZG93cy1Db21wdXRlci1CdXNpbmVzcy0yeFVTQjMtMC9kcC9CMEQ5WFFLUlpRP3NvdXJjZT1wcy1zbC1zaG9wcGluZ2Fkcy1scGNvbnRleHQmcmVmXz1mcGxmcyZwc2M9MSZzbWlkPUEyRUo0UjAwVFhEV0c1P3Byb2R1Y3RfaWQ9MTc4NjE0MDM0NzM2MjU3NzkyNDUmc291cmNlPUFtYXpvbi5jb20rLStTZWxsZXImdGl0bGU9MTUuNiUyMitTY2hvb2wrTGFwdG9wJnByaWNlPTE5OS45OSIsInVzZXJJZCI6IjY4NzI5MGVkYzUwYTJmYzJjMmI0ZThiOSJ9",
    "rating": 0,
    "reviews": 0
  }
]

export default function ExplorePage() {
  const [products, setProducts] = React.useState(mockProducts); // TODO use [] for actual products
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const token = Browser.getToken()

  const handleRefreshRecommendations = async () => {
    setIsLoading(true);
    setError('');
    
    try {      
      await axios.post(`http://localhost:3000/api/recommender/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      setError('Unable to clear cache: ' + (error.response?.data?.error || error.message));
      setIsLoading(false);
      return;
    }      

    try {
      var response = await axios.get(`http://localhost:3000/api/recommender`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      setError('Unable to refresh recommendations: ' + (error.response?.data?.error || error.message));
      setIsLoading(false);
      return;
    } 

    if (response.status !== 200) {
      setError('Failed to refresh recommendations');
      setIsLoading(false);
      return;
    }

    setProducts(response.data.recommendedProducts);
    setError('');
    setIsLoading(false);
  };

  return (
    <>
      <FillRecommendedProducts
        setError={setError}
        setProducts={setProducts}
        setIsLoading={setIsLoading}
      />
      <main className="explore-container">
        <div className="explore-padding">
          <div className="explore-header">
            <h1>Explore Products</h1>
            <button 
              className="refresh-button" 
              onClick={handleRefreshRecommendations}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <ConditionalProductGrid 
            error={error} 
            products={products}
            isLoading={isLoading}
          />
        </div>
      </main>
    </>
  )
}

function FillRecommendedProducts({
  setError,
  setProducts,
  setIsLoading
}) {
  /** Loads when the component loads the first time */
  React.useEffect(() => {
    // TODO get all products from chat history and filter for relevance to the user
    // TODO then add those products with the fetched recommended products to increase the number of results
    async function fillRecommendedProducts() {
      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // TODO remove later on. Only for test
        
        var response = await axios.get(`http://localhost:3000/api/recommender`,{
          headers: {
            'Authorization': `Bearer ${Browser.getToken()}`
          }
        })        
      } catch (error) {
        setError('Unable to fetch recommended products ', error);
        setIsLoading(false);
        return;
      }
      
      if (response.status !== 200) {
        setError('Unable to fetch recommended products');
        setIsLoading(false);
        return;
      }

      setProducts(response.data.recommendedProducts);
      setError('');
      setIsLoading(false);
    }
    fillRecommendedProducts();
  }, [])
}

function ConditionalProductGrid({
  error,
  products,
  isLoading
}) {
  const conditionalError = error 
    ? <div className='explore-error'>{error}</div> 
    : null;

  const conditionalProducts = products.length === 0
    ? <div>No products found</div>
    : <div className="product-list">        
        {
          products?.map((product) => 
            <ProductCard product={product} />
          )
        }
      </div> 

  return (
    <>
      {
        isLoading
          ? <OrbitProgress 
              style={{ fontSize: '12px', paddingTop: '2rem' }} 
              color={["#77abd4", "#206599", "#77abd4", "#206599"]} 
              dense
              speedPlus='0'
            />
          : <>
              {conditionalError}     
              {conditionalProducts}
            </>
      }      
    </>
  )
}