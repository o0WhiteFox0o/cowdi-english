# 📖 COWDI ENGLISH — SỔ TAY QUẢN LÝ TÀI NGUYÊN HÌNH ẢNH (IMAGE CATALOG)

Tài liệu này lưu trữ toàn bộ quy chuẩn thiết kế, danh mục đường dẫn file ảnh, trạng thái và quy tắc tổ chức thư mục hình ảnh trong ứng dụng **Cowdi English**.

---

## 🎨 1. Quy chuẩn thiết kế (Art & Design System)

Mọi hình ảnh thẻ bài minh họa trong Cowdi English đều tuân theo chuẩn mỹ thuật đồng bộ:
- **Phong cách mỹ thuật**: Kawaii Chibi Sticker (Miếng dán hình hoạt hình dễ thương phong cách Anime).
- **Đường viền đặc trưng**: Viền trắng dày (Thick white die-cut sticker outline) bao quanh toàn bộ nhân vật/vật phẩm, tạo hiệu ứng sticker vinyl bóng nổi trên nền.
- **Biểu cảm nhân vật**: Mắt anime to tròn long lanh có đốm sáng phản chiếu, má ửng hồng phấn ngọt ngào, miệng cười vui vẻ, các hạt sao lấp lánh (sparkles) và trái tim bay lượn xung quanh.
- **Màu nền**: Nền phẳng màu pastel đơn sắc (Solid pastel background), tuyệt đối không dùng gradient phức tạp hay chi tiết nền gây rối mắt.
- **Tỷ lệ khung hình**: Dọc tỷ lệ **3:4** (Portrait Aspect Ratio).
- **Độ phân giải chuẩn**: $768 \times 1024\text{ px}$ hoặc $896 \times 1152\text{ px}$, định dạng **PNG** tối ưu nén (dung lượng lý tưởng $300\text{ KB} - 450\text{ KB}$).
- **Quy tắc chữ**: Tuyệt đối không vẽ chữ, ký tự hoặc số lạ lên tranh vẽ sticker.

---

## 📁 2. Sơ đồ cây thư mục (Directory Tree)

Toàn bộ ảnh được lưu trữ trong thư mục gốc `public/image/` (và đồng bộ bản sao trong `image/` và `dist-prod/image/`):

```text
public/image/
├── 📁 topics/              # 13 ảnh bìa thẻ chủ đề chính
├── 📁 subtopics/           # 57 ảnh thẻ con theo từng thư mục chủ đề
│   ├── 📁 human/           # Chủ đề Con người (7 thẻ)
│   ├── 📁 eating/          # Chủ đề Ăn uống (7 thẻ)
│   ├── 📁 drinking/        # Chủ đề Đồ uống (5 thẻ)
│   ├── 📁 house/           # Chủ đề Nhà cửa (5 thẻ)
│   ├── 📁 transportation/  # Chủ đề Giao thông (4 thẻ)
│   ├── 📁 love/            # Chủ đề Tình yêu (4 thẻ)
│   ├── 📁 numbers/         # Chủ đề Số đếm (4 thẻ)
│   ├── 📁 sports/          # Chủ đề Thể thao (3 thẻ)
│   ├── 📁 holidays/        # Chủ đề Ngày lễ (3 thẻ)
│   ├── 📁 animals/         # Chủ đề Động vật (4 thẻ)
│   ├── 📁 nature/          # Chủ đề Thiên nhiên (4 thẻ)
│   ├── 📁 public-places/   # Chủ đề Nơi công cộng (4 thẻ)
│   └── 📁 countries/       # Chủ đề Quốc gia (4 thẻ)
├── 📁 icons/               # 13 icon tròn header tiêu đề chủ đề
├── 📁 minigames/           # 6 ảnh thẻ bài Mini-game
└── 📁 practice/            # 15 ảnh thẻ bài Luyện tập & Ôn tập
```

---

## 📋 3. Danh mục chi tiết các file ảnh

### 🌟 BẢNG 1: 13 THẺ CHỦ ĐỀ CHÍNH (`public/image/topics/`)

| ID Chủ đề | Tên Tiếng Anh | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `human` | Human | Con người | `/image/topics/human.png` | ✅ Đã có |
| `eating` | Eating | Ăn uống | `/image/topics/eating.png` | ✅ Đã có |
| `drinking` | Drinking | Đồ uống | `/image/topics/drinking.png` | ✅ Đã có |
| `house` | House | Nhà cửa | `/image/topics/house.png` | ✅ Đã có |
| `transportation` | Transport | Giao thông | `/image/topics/transportation.png` | ✅ Đã có |
| `love` | Love | Tình yêu | `/image/topics/love.png` | ✅ Đã có |
| `numbers` | Numbers | Số đếm | `/image/topics/numbers.png` | ✅ Đã có |
| `sports` | Sports | Thể thao | `/image/topics/sports.png` | ✅ Đã có |
| `holidays` | Holidays | Ngày lễ | `/image/topics/holidays.png` | ✅ Đã có |
| `animals` | Animals | Động vật | `/image/topics/animals.png` | ✅ Đã có |
| `nature` | Nature | Thiên nhiên | `/image/topics/nature.png` | ✅ Đã có |
| `public-places` | Public Places | Nơi công cộng | `/image/topics/public-places.png` | ✅ Đã có |
| `countries` | Countries | Quốc gia | `/image/topics/countries.png` | ✅ Đã có |

---

### 🏷️ BẢNG 2: 13 ICON TIÊU ĐỀ HEADER (`public/image/icons/`)

| ID Chủ đề | Tên Tiếng Anh | Đường dẫn file icon | Trạng thái |
| :--- | :--- | :--- | :---: |
| `human` | Human | `/image/subtopics/human/icon.png` | ✅ Cậu bé thám tử |
| `eating` | Eating | `/image/icons/eating-icon.png` | ✅ Đã có |
| `drinking` | Drinking | `/image/icons/drinking-icon.png` | ✅ Đã có |
| `house` | House | `/image/icons/house-icon.png` | ✅ Đã có |
| `transportation` | Transport | `/image/icons/transportation-icon.png` | ✅ Đã có |
| `love` | Love | `/image/icons/love-icon.png` | ✅ Đã có |
| `numbers` | Numbers | `/image/icons/numbers-icon.png` | ✅ Đã có |
| `sports` | Sports | `/image/icons/sports-icon.png` | ✅ Đã có |
| `holidays` | Holidays | `/image/icons/holidays-icon.png` | ✅ Đã có |
| `animals` | Animals | `/image/icons/animals-icon.png` | ✅ Đã có |
| `nature` | Nature | `/image/icons/nature-icon.png` | ✅ Đã có |
| `public-places` | Public Places | `/image/icons/public-places-icon.png` | ✅ Đã có |
| `countries` | Countries | `/image/icons/countries-icon.png` | ✅ Đã có |

---

### 🗂️ BẢNG 3: 57 THẺ CHỦ ĐỀ CON SUBTOPICS (`public/image/subtopics/`)

#### 1. Chủ đề Human (`subtopics/human/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `human-body` | Body Parts | Bộ phận cơ thể | `/image/subtopics/human/body.png` | ✅ Đã có |
| `human-appearance` | Appearance | Ngoại hình | `/image/subtopics/human/appearance.png` | ✅ Đã có |
| `human-personality` | Personality | Tính cách | `/image/subtopics/human/personality.png` | ✅ Đã có |
| `human-emotions` | Emotions | Cảm xúc | `/image/subtopics/human/emotions.png` | ✅ Đã có |
| `human-family` | Family | Gia đình | `/image/subtopics/human/family.png` | ✅ Đã có |
| `human-lifecycle` | Life Stages | Giai đoạn sống | `/image/subtopics/human/lifecycle.png` | ✅ Đã có |
| `human-more` | More | Mở rộng | `/image/subtopics/human/more.png` | ✅ Đã có |

#### 2. Chủ đề Eating (`subtopics/eating/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `eating-fruits` | Fruits | Trái cây | `/image/subtopics/eating/fruits.png` | ✅ Đã có |
| `eating-vegetables` | Vegetables | Rau củ | `/image/subtopics/eating/vegetables.png` | ✅ Đã có |
| `eating-meat-seafood` | Meat & Seafood | Thịt & Hải sản | `/image/subtopics/eating/meat_seafood.png` | ✅ Đã có |
| `eating-cooking` | Cooking | Nấu ăn & Gia vị | `/image/subtopics/eating/cooking.png` | ✅ Đã có |
| `eating-meals` | Meals | Bữa ăn & Món ăn | `/image/subtopics/eating/meals.png` | ✅ Đã có |
| `eating-taste` | Taste | Vị & Kết cấu | `/image/subtopics/eating/taste.png` | ✅ Đã có |
| `eating-more` | More | Mở rộng | `/image/subtopics/eating/more.png` | ✅ Đã có |

#### 3. Chủ đề Drinking (`subtopics/drinking/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `drinking-hot` | Hot Drinks | Đồ uống nóng | `/image/subtopics/drinking/hot.png` | ✅ Đã có |
| `drinking-cold` | Cold Drinks | Đồ uống lạnh | `/image/subtopics/drinking/cold.png` | ✅ Đã có |
| `drinking-dairy` | Dairy & Milk | Sữa & Chế phẩm | `/image/subtopics/drinking/dairy.png` | ✅ Đã có |
| `drinking-actions` | Drinking | Hành động uống | `/image/subtopics/drinking/actions.png` | ✅ Đã có |
| `drinking-more` | More | Mở rộng | `/image/subtopics/drinking/more.png` | ✅ Đã có |

#### 4. Chủ đề House (`subtopics/house/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `house-rooms` | Rooms | Các phòng | `/image/subtopics/house/rooms.png` | ✅ Đã có |
| `house-furniture` | Furniture | Nội thất | `/image/subtopics/house/furniture.png` | ✅ Đã có |
| `house-appliances` | Appliances | Thiết bị gia dụng | `/image/subtopics/house/appliances.png` | ✅ Đã có |
| `house-chores` | Housework | Việc nhà | `/image/subtopics/house/chores.png` | ✅ Đã có |
| `house-more` | More | Mở rộng | `/image/subtopics/house/more.png` | ✅ Đã có |

#### 5. Chủ đề Transportation (`subtopics/transportation/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `transport-vehicles` | Vehicles | Phương tiện | `/image/subtopics/transportation/vehicles.png` | ✅ Đã có |
| `transport-road` | Road Traffic | Đường & Giao thông | `/image/subtopics/transportation/road.png` | ✅ Đã có |
| `transport-actions` | Travel | Hành động đi lại | `/image/subtopics/transportation/actions.png` | ⏳ Chờ cập nhật |
| `transportation-more` | More | Mở rộng | `/image/subtopics/transportation/more.png` | ⏳ Chờ cập nhật |

#### 6. Chủ đề Love (`subtopics/love/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `love-feelings` | Feelings | Cảm xúc yêu | `/image/subtopics/love/feelings.png` | ⏳ Chờ cập nhật |
| `love-relationships` | Relationships | Mối quan hệ | `/image/subtopics/love/relationships.png` | ⏳ Chờ cập nhật |
| `love-dating` | Dating | Hẹn hò & Kết hôn | `/image/subtopics/love/dating.png` | ⏳ Chờ cập nhật |
| `love-more` | More | Mở rộng | `/image/subtopics/love/more.png` | ⏳ Chờ cập nhật |

#### 7. Chủ đề Numbers (`subtopics/numbers/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `numbers-basic` | Cardinal | Số đếm cơ bản | `/image/subtopics/numbers/basic.png` | ⏳ Chờ cập nhật |
| `numbers-ordinal` | Ordinal | Số thứ tự | `/image/subtopics/numbers/ordinal.png` | ⏳ Chờ cập nhật |
| `numbers-math` | Math | Toán & Đo lường | `/image/subtopics/numbers/math.png` | ⏳ Chờ cập nhật |
| `numbers-more` | More | Mở rộng | `/image/subtopics/numbers/more.png` | ⏳ Chờ cập nhật |

#### 8. Chủ đề Sports (`subtopics/sports/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `sports-types` | Sports | Các môn thể thao | `/image/subtopics/sports/types.png` | ⏳ Chờ cập nhật |
| `sports-actions` | Fitness | Tập luyện & Dụng cụ | `/image/subtopics/sports/actions.png` | ⏳ Chờ cập nhật |
| `sports-more` | More | Mở rộng | `/image/subtopics/sports/more.png` | ⏳ Chờ cập nhật |

#### 9. Chủ đề Holidays (`subtopics/holidays/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `holidays-types` | Holidays | Các ngày lễ | `/image/subtopics/holidays/types.png` | ⏳ Chờ cập nhật |
| `holidays-activities` | Celebrations | Hoạt động lễ hội | `/image/subtopics/holidays/activities.png` | ⏳ Chờ cập nhật |
| `holidays-more` | More | Mở rộng | `/image/subtopics/holidays/more.png` | ⏳ Chờ cập nhật |

#### 10. Chủ đề Animals (`subtopics/animals/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `animals-pets` | Pets & Farm | Thú cưng & Gia súc | `/image/subtopics/animals/pets.png` | ⏳ Chờ cập nhật |
| `animals-wild` | Wild Animals | Động vật hoang dã | `/image/subtopics/animals/wild.png` | ⏳ Chờ cập nhật |
| `animals-sea` | Sea Creatures | Sinh vật biển | `/image/subtopics/animals/sea.png` | ⏳ Chờ cập nhật |
| `animals-more` | More | Mở rộng | `/image/subtopics/animals/more.png` | ⏳ Chờ cập nhật |

#### 11. Chủ đề Nature (`subtopics/nature/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `nature-weather` | Weather | Thời tiết | `/image/subtopics/nature/weather.png` | ⏳ Chờ cập nhật |
| `nature-landscape` | Landscape | Địa hình | `/image/subtopics/nature/landscape.png` | ⏳ Chờ cập nhật |
| `nature-plants` | Plants & Trees | Cây cối & Hoa | `/image/subtopics/nature/plants.png` | ⏳ Chờ cập nhật |
| `nature-more` | More | Mở rộng | `/image/subtopics/nature/more.png` | ⏳ Chờ cập nhật |

#### 12. Chủ đề Public Places (`subtopics/public-places/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `places-services` | Services | Dịch vụ & Tòa nhà | `/image/subtopics/public-places/services.png` | ⏳ Chờ cập nhật |
| `places-shopping` | Shopping | Mua sắm & Ăn uống | `/image/subtopics/public-places/shopping.png` | ⏳ Chờ cập nhật |
| `places-entertainment` | Fun & Leisure | Giải trí | `/image/subtopics/public-places/entertainment.png` | ⏳ Chờ cập nhật |
| `public-places-more` | More | Mở rộng | `/image/subtopics/public-places/more.png` | ⏳ Chờ cập nhật |

#### 13. Chủ đề Countries (`subtopics/countries/`)
| ID Thẻ con | Tên Banner | Tên Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `countries-asia` | Asia | Châu Á | `/image/subtopics/countries/asia.png` | ⏳ Chờ cập nhật |
| `countries-world` | Americas & Europe | Châu Mỹ & Châu Âu | `/image/subtopics/countries/world.png` | ⏳ Chờ cập nhật |
| `countries-language` | Languages | Ngôn ngữ & Quốc tịch | `/image/subtopics/countries/languages.png` | ⏳ Chờ cập nhật |
| `countries-more` | More | Mở rộng | `/image/subtopics/countries/more.png` | ⏳ Chờ cập nhật |

---

### 🎮 BẢNG 4: 6 THẺ BÀI MINI-GAME (`public/image/minigames/`)

| ID Game | Tên Game Tiếng Việt | Tên Tiếng Anh | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| `word-catch` | Cowdi Bắt Từ | Word Catch | `/image/minigames/minigame_cowdi_bat_tu.png` | ✅ Đã có |
| `sentence-puzzle` | Ghép câu | Sentence | `/image/minigames/minigame_ghep_cau.png` | ✅ Đã có |
| `memory-match` | Lật thẻ nhớ | Memory Match | `/image/minigames/minigame_lat_the_nho.png` | ✅ Đã có |
| `spelling-bee` | Spelling Bee | Spelling Bee | `/image/minigames/minigame_spelling_bee.png` | ✅ Đã có |
| `speed-match` | Tốc độ ánh sáng | Speed Match | `/image/minigames/minigame_toc_do_anh_sang.png` | ✅ Đã có |
| `word-scramble` | Xáo chữ | Scramble | `/image/minigames/minigame_xao_chu.png` | ✅ Đã có |

---

### 📚 BẢNG 5: 15 THẺ CHẾ ĐỘ LUYỆN TẬP & ÔN TẬP (`public/image/practice/`)

| Mã chế độ | Tên chế độ Tiếng Việt | Đường dẫn file ảnh | Trạng thái |
| :--- | :--- | :--- | :---: |
| `vocab` | Từ điển & Flashcard | `/image/practice/tu_dien.png` | ✅ Đã có |
| `grammar` | Ngữ pháp cơ bản | `/image/practice/ngu_phap.png` | ✅ Đã có |
| `listening` / `listenPick` | Luyện nghe hiểu | `/image/practice/practice_nghe_hieu.png` | ✅ Đã có |
| `sentences` | Hoàn thành câu | `/image/practice/hoan_thanh_cau.png` | ✅ Đã có |
| `dictation` | Nghe viết chính tả | `/image/practice/nghe_cau.png` | ✅ Đã có |
| `matching` | Nối cặp từ vựng | `/image/practice/noi_cap.png` | ✅ Đã có |
| `fillin` / `wordBuild` | Ghép chữ điền khuyết | `/image/practice/ghep_chu.png` | ✅ Đã có |
| `reorder` | Sắp xếp trật tự câu | `/image/practice/xap_xep_cau.png` | ✅ Đã có |
| `listenSentence` | Nghe và nối câu | `/image/practice/noi_cau.png` | ✅ Đã có |
| `speedRound` / `speakFast` | Phản xạ nói nhanh | `/image/practice/phan_xa_noi.png` | ✅ Đã có |
| `wordGuess` / `contextClue` | Đoán nghĩa ngữ cảnh | `/image/practice/doan_nghia.png` | ✅ Đã có |
| `trueFalse` | Đúng hay Sai | `/image/practice/dung_sai.png` | ✅ Đã có |
| `translateWrite` | Viết dịch câu | `/image/practice/viet_cau.png` | ✅ Đã có |
| `mixed` | Thử thách tổng hợp | `/image/practice/tong_hop.png` | ✅ Đã có |
| `speakWord` / `readAloud` | Đọc to phát âm | `/image/practice/doc_to.png` | ✅ Đã có |

---

## 🛠️ 4. Cách Admin thay đổi hoặc cập nhật ảnh mới

### Cách 1: Sử dụng giao diện Admin trực quan (Dành riêng cho Admin)
1. Truy cập trang Quản trị: `http://localhost:5173/admin`
2. Chọn tab **"🖼️ Quản lý ảnh"** (Image Asset Manager).
3. Tìm thẻ bạn muốn đổi ảnh (lọc theo Chủ đề, Mini-game, Luyện tập, Icon).
4. Bấm **"Đổi ảnh / Đổi đường dẫn"**:
   - Chọn tải file ảnh mới từ máy tính (kéo thả hoặc bấm chọn ảnh `.png`, `.jpg`, `.webp`).
   - Hoặc nhập đường dẫn URL / đường dẫn file mới.
5. Bấm **"Lưu thay đổi"**: Ứng dụng sẽ tự động ghi đè và cập nhật ngay lập tức mà không cần khởi động lại máy chủ!

### Cách 2: Thêm file trực tiếp vào mã nguồn
1. Đặt file ảnh mới với tỷ lệ 3:4 vào thư mục tương ứng trong `public/image/subtopics/<tên-chủ-đề>/`.
2. Mở file [src/pages/VocabularyPage.jsx](file:///e:/cowdi-english/src/pages/VocabularyPage.jsx).
3. Trong biến `SUBTOPIC_ART_IMAGES`, trỏ ID của thẻ con tới file vừa thêm:
   ```javascript
   'transport-actions': '/image/subtopics/transportation/actions.png',
   ```
4. Lưu file và trang web sẽ tự động Hot-Reload hiển thị ảnh mới!
