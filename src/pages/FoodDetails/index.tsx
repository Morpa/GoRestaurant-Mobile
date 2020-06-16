import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

import formatValue from '../../utils/formatValue';
import api from '../../services/api';

import * as S from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get(`/foods/${routeParams.id}`);

      setFood({
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      });

      setExtras(
        response.data.extras.map((extra: Omit<Extra, 'quantity'>) => ({
          ...extra,
          quantity: 0,
        })),
      );
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    setExtras(
      extras.map(extra =>
        extra.id === id ? { ...extra, quantity: extra.quantity + 1 } : extra,
      ),
    );
  }

  function handleDecrementExtra(id: number): void {
    const findExtra = extras.find(extra => extra.id === id);

    if (!findExtra) return;
    if (findExtra.quantity === 0) return;

    setExtras(
      extras.map(extra =>
        extra.id === id ? { ...extra, quantity: extra.quantity - 1 } : extra,
      ),
    );
  }

  function handleIncrementFood(): void {
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    if (foodQuantity === 1) return;

    setFoodQuantity(foodQuantity - 1);
  }

  const toggleFavorite = useCallback(() => {
    if (isFavorite) {
      api.delete(`/favorites/${food.id}`);
    } else {
      api.post(`/favorites`, food);
    }

    setIsFavorite(!isFavorite);
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const extraTotal = extras.reduce((accumulator, extra) => {
      return accumulator + extra.quantity * extra.value;
    }, 0);

    const foodTotal = food.price;

    return formatValue((extraTotal + foodTotal) * foodQuantity);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <S.Container>
      <S.Header />

      <S.ScrollContainer>
        <S.FoodsContainer>
          <S.Food>
            <S.FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </S.FoodImageContainer>
            <S.FoodContent>
              <S.FoodTitle>{food.name}</S.FoodTitle>
              <S.FoodDescription>{food.description}</S.FoodDescription>
              <S.FoodPricing>{food.formattedPrice}</S.FoodPricing>
            </S.FoodContent>
          </S.Food>
        </S.FoodsContainer>
        <S.AdditionalsContainer>
          <S.Title>Adicionais</S.Title>
          {extras.map(extra => (
            <S.AdittionalItem key={extra.id}>
              <S.AdittionalItemText>{extra.name}</S.AdittionalItemText>
              <S.AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <S.AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </S.AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </S.AdittionalQuantity>
            </S.AdittionalItem>
          ))}
        </S.AdditionalsContainer>
        <S.TotalContainer>
          <S.Title>Total do pedido</S.Title>
          <S.PriceButtonContainer>
            <S.TotalPrice testID="cart-total">{cartTotal}</S.TotalPrice>
            <S.QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <S.AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </S.AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </S.QuantityContainer>
          </S.PriceButtonContainer>

          <S.FinishOrderButton onPress={() => handleFinishOrder()}>
            <S.ButtonText>Confirmar pedido</S.ButtonText>
            <S.IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </S.IconContainer>
          </S.FinishOrderButton>
        </S.TotalContainer>
      </S.ScrollContainer>
    </S.Container>
  );
};

export default FoodDetails;
