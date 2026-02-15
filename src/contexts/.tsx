const { updateProfile } = useAuth();

const onClick = async () => {
  const { error } = await updateProfile({
    full_name: 'Sofiane BOUAKSA',
    job_title: 'Cuisinier',
    establishment: 'BERNE',
    restaurant_role: 'chef',
  });

  if (error) console.error(error);
};

