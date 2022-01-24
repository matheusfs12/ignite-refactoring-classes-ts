import { useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood/index';
import { FoodsContainer } from './styles';
import { IFood } from '../../types';

export const Dashboard = () => {
	const [foods, setFoods] = useState<IFood[]>([]);
	const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
	const [modalOpen, setModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);

	useEffect(() => {
		async function fetchFoods(): Promise<void> {
			const response = await api.get('/foods');

			setFoods(response.data);
		}

		fetchFoods();
	}, []);

	async function handleAddFood(food: Omit<IFood, 'id' | 'available'>): Promise<void> {
		try {
			const response = await api.post('/foods', {
				...food,
				available: true,
			});

			setFoods([...foods, response.data]);
		} catch (err) {
			console.log(err);
		}
	}

	async function handleUpdateFood(food: Omit<IFood, 'id' | 'available'>): Promise<void> {
		const foodUpdated = await api.put(
			`/foods/${editingFood.id}`,
			{ ...editingFood, ...food },
		);

		const foodsUpdated = foods.map(f =>
			f.id !== foodUpdated.data.id ? f : foodUpdated.data,
		);;

		setFoods(foodsUpdated);
	}

	async function handleDeleteFood(id: number): Promise<void> {
		await api.delete(`/foods/${id}`);

		const foodsFiltered = foods.filter(f => f.id !== id);

		setFoods(foodsFiltered);
	}

	function toggleModal(): void {
		setModalOpen(!modalOpen);
	}

	function toggleEditModal(): void {
		setEditModalOpen(!editModalOpen);
	}

	function handleEditFood(food: IFood): void {
		setEditingFood(food);
		setEditModalOpen(true);
	}

	return (
		<>
			<Header openModal={toggleModal} />
			<ModalAddFood
				isOpen={modalOpen}
				setIsOpen={toggleModal}
				handleAddFood={handleAddFood}
			/>
			<ModalEditFood
				isOpen={editModalOpen}
				setIsOpen={toggleEditModal}
				editingFood={editingFood}
				handleUpdateFood={handleUpdateFood}
			/>

			<FoodsContainer data-testid="foods-list">
				{foods &&
					foods.map(food => (
						<Food
							key={food.id}
							food={food}
							handleDelete={handleDeleteFood}
							handleEditFood={handleEditFood}
						/>
					))}
			</FoodsContainer>
		</>
	);
}
