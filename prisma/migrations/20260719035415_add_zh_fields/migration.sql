-- AlterTable
ALTER TABLE "LifeEvent" ADD COLUMN     "descriptionZh" TEXT,
ADD COLUMN     "locationNameZh" TEXT,
ADD COLUMN     "titleZh" TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "bornCityZh" TEXT,
ADD COLUMN     "bornCountryZh" TEXT,
ADD COLUMN     "nameZh" TEXT;
