import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import * as S from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  formattedPrice: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Food[]>([]);

  useEffect(() => {
    async function loadFavorites(): Promise<void> {
      const response = await api.get('/favorites');

      setFavorites(
        response.data.map(favorite => ({
          ...favorite,
          formattedPrice: formatValue(favorite.price),
        })),
      );
    }

    loadFavorites();
  }, []);

  return (
    <S.Container>
      <S.Header>
        <S.HeaderTitle>Meus favoritos</S.HeaderTitle>
      </S.Header>

      <S.FoodsContainer>
        <S.FoodList
          data={favorites}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <S.Food activeOpacity={0.6}>
              <S.FoodImageContainer>
                <Image
                  style={{ width: 88, height: 88 }}
                  source={{ uri: item.thumbnail_url }}
                />
              </S.FoodImageContainer>
              <S.FoodContent>
                <S.FoodTitle>{item.name}</S.FoodTitle>
                <S.FoodDescription>{item.description}</S.FoodDescription>
                <S.FoodPricing>{item.formattedPrice}</S.FoodPricing>
              </S.FoodContent>
            </S.Food>
          )}
        />
      </S.FoodsContainer>
    </S.Container>
  );
};

export default Favorites;
