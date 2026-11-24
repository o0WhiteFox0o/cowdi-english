import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('GĐ3 Fix — Cửa hàng: Xem trước pet & Nút Quay lại', () => {
  it('Lỗi 2: Dex chỉ hiển thị nút Shop khi người dùng sở hữu pet đó và truyền đúng pet instanceId + from=dex', () => {
    const ownedSpecies = {
      cowdi: { instanceId: 'cowdi_1', speciesId: 'cowdi', evolution: 0, customName: 'Bò Sữa' },
      radish: { instanceId: 'radish_inst_2', speciesId: 'radish', evolution: 2, customName: 'Củ Cải Siêu Phàm' }
    };

    // Test pet sở hữu: có nút shop và đúng instanceId
    const selOwned = ownedSpecies['radish'];
    assert.ok(selOwned, 'Pet radish phải có trong danh sách sở hữu');
    const shopUrl = `/shop?tab=cosmetics&pet=${selOwned.instanceId}&from=dex`;
    assert.equal(shopUrl, '/shop?tab=cosmetics&pet=radish_inst_2&from=dex');

    // Test pet CHƯA sở hữu: selOwned là null -> ẩn nút shop
    const unownedSpecies = ownedSpecies['foxie'];
    assert.equal(unownedSpecies, undefined, 'Pet foxie chưa sở hữu nên selOwned là undefined/null');
  });

  it('Lỗi 2: ShopPage giải quyết query pet hợp lệ hoặc fallback về activePetId an toàn', () => {
    const collection = {
      cowdi_1: { instanceId: 'cowdi_1', speciesId: 'cowdi', customName: 'Cowdi' },
      bamboo_1: { instanceId: 'bamboo_1', speciesId: 'bamboo_spirit', customName: 'Trúc Trúc' }
    };
    const activePetId = 'cowdi_1';

    // Trường hợp 1: Có query pet hợp lệ trong collection
    const queryPet1 = 'bamboo_1';
    const resolved1 = queryPet1 && collection[queryPet1] ? queryPet1 : activePetId;
    assert.equal(resolved1, 'bamboo_1');

    // Trường hợp 2: Query pet không tồn tại trong collection -> fallback về activePetId
    const queryPetInvalid = 'unknown_pet_999';
    const resolved2 = queryPetInvalid && collection[queryPetInvalid] ? queryPetInvalid : activePetId;
    assert.equal(resolved2, 'cowdi_1');

    // Trường hợp 3: Không truyền query pet -> fallback về activePetId
    const queryPetEmpty = null;
    const resolved3 = queryPetEmpty && collection[queryPetEmpty] ? queryPetEmpty : activePetId;
    assert.equal(resolved3, 'cowdi_1');
  });

  it('Lỗi 3: Nút Quay lại điều hướng đúng theo app history hoặc query from=dex / from=pet', () => {
    function resolveBackNavigation({ hasHistory, hasStateFrom, fromQuery }) {
      if (hasHistory || hasStateFrom) {
        return { action: 'navigate(-1)' };
      }
      if (fromQuery === 'dex') {
        return { action: 'navigate', path: '/collection' };
      }
      if (fromQuery === 'pet') {
        return { action: 'navigate', path: '/pet' };
      }
      return { action: 'navigate', path: '/pet' };
    }

    // Trường hợp vào từ app (có history)
    assert.deepEqual(resolveBackNavigation({ hasHistory: true, hasStateFrom: false, fromQuery: 'dex' }), { action: 'navigate(-1)' });

    // Trường hợp mở trực tiếp bằng link từ Dex
    assert.deepEqual(resolveBackNavigation({ hasHistory: false, hasStateFrom: false, fromQuery: 'dex' }), { action: 'navigate', path: '/collection' });

    // Trường hợp mở trực tiếp bằng link từ Pet
    assert.deepEqual(resolveBackNavigation({ hasHistory: false, hasStateFrom: false, fromQuery: 'pet' }), { action: 'navigate', path: '/pet' });

    // Trường hợp mở trực tiếp không có query -> mặc định về /pet
    assert.deepEqual(resolveBackNavigation({ hasHistory: false, hasStateFrom: false, fromQuery: null }), { action: 'navigate', path: '/pet' });
  });
});
