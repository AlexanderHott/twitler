import { useRouter } from "next/router";
import Timeline from "../components/Timeline";

const UserPage = () => {
  const router = useRouter();
  const name = router.query.name as string;
  return (
    <div>
      <Timeline where={{ author: { name } }} hideCreateForm title={name} />
    </div>
  );
};

export default UserPage;
