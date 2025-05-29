import JWTDecoder from '@/components/JWTDecoder';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <JWTDecoder />
      </div>
    </div>
  );
};

export default Index;
